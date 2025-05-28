from flask import Blueprint, jsonify, request, send_file
from werkzeug.utils import secure_filename
import mysql.connector
from io import BytesIO
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from utils.db import cursor, db  # Asegúrate de que db esté correctamente importado

# Configuración de la contraseña de Gmail desde una variable de entorno
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")

solicitudes_bp = Blueprint('solicitudes', __name__)

@solicitudes_bp.route('/solicitar-discapacidad', methods=['POST'])
def solicitar_discapacidad():
    try:
        # Obtener datos
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        dni = request.form.get("dni")
        grado_discapacidad = request.form.get("grado_discapacidad")
        usuario = request.form.get("usuario")
        archivo = request.files.get("archivo")

        if not all([nombre, apellido, dni, grado_discapacidad, usuario]):
            return jsonify(success=False, message="Faltan datos obligatorios."), 400

        archivo_bytes = None
        archivo_nombre = None
        if archivo:
            archivo_nombre = secure_filename(archivo.filename)
            archivo_bytes = archivo.read()

        # Verificar duplicados
        cursor.execute("SELECT id FROM solicitudes_discapacidad WHERE dni = %s OR usuario = %s", (dni, usuario))
        if cursor.fetchone():
            return jsonify(success=False, message="Ya existe una solicitud para este usuario o DNI."), 409

        # Insertar solicitud
        cursor.execute(""" 
            INSERT INTO solicitudes_discapacidad 
            (nombre, apellido, dni, grado_discapacidad, archivo, archivo_nombre, estado, fecha_solicitud, usuario) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), %s)
        """, (nombre, apellido, dni, grado_discapacidad, archivo_bytes, archivo_nombre, "pendiente", usuario))

        # Actualizar usuario
        cursor.execute("UPDATE users SET discapacidad = %s WHERE user = %s", ("sí", usuario))

        db.commit()

        # Solo aquí devuelves éxito, después de commit sin errores
        return jsonify(success=True, message="Solicitud registrada correctamente."), 201

    except mysql.connector.Error as err:
        db.rollback()
        print("Error base de datos:", err)
        return jsonify(success=False, message=f"Error en la solicitud: {err}"), 500

    except Exception as e:
        db.rollback()
        print("Error inesperado:", e)
        return jsonify(success=False, message="Error inesperado en el servidor."), 500

@solicitudes_bp.route('/discapacidad', methods=['GET'])
def listar_solicitudes_discapacidad():
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(""" 
            SELECT id, nombre, apellido, dni, grado_discapacidad, archivo_nombre, estado 
            FROM solicitudes_discapacidad
            WHERE estado = 'pendiente'
        """)
        solicitudes = cursor.fetchall()
        cursor.close()

        if not solicitudes:
            return jsonify(success=False, message="No hay solicitudes pendientes.")

        return jsonify(success=True, solicitudes=solicitudes), 200

    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener solicitudes: {str(err)}"), 500


    except mysql.connector.Error as err:
        print(f"Error al obtener solicitudes: {err}")
        return jsonify(success=False, message=f"Error al obtener solicitudes: {str(err)}"), 500
@solicitudes_bp.route('/archivo-solicitud/<int:solicitud_id>', methods=['GET'])
def descargar_archivo_blob(solicitud_id):
    try:
        cursor.execute("SELECT archivo, archivo_nombre FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()
        if not result:
            return "Archivo no encontrado", 404

        archivo_bytes = result['archivo']
        archivo_nombre = result.get('archivo_nombre', f"archivo_{solicitud_id}.pdf")  # nombre por defecto

        return send_file(
            BytesIO(archivo_bytes),
            download_name=archivo_nombre,
            as_attachment=True
        )
    except Exception as e:
        print(f"❌ Error al servir el archivo: {e}")
        return "Error al descargar archivo", 500

# Función para enviar el correo de notificación
def enviar_correo_estado(destinatario, nombre_usuario, estado):
    remitente = "buystickets.customer@gmail.com"

    asunto = "Resultado de solicitud de cuenta con discapacidad"
    if estado == "aprobada":
        cuerpo = f"""Hola {nombre_usuario},

        Tu solicitud de cuenta con discapacidad ha sido APROBADA.
        Ya puedes acceder a los beneficios asociados a este tipo de cuenta.

        Gracias por confiar en BuyTickets.

        El equipo de BuyTickets
        """
    else:  # En caso de que sea "rechazada"
        cuerpo = f"""Hola {nombre_usuario},

        Lamentamos informarte que tu solicitud de cuenta con discapacidad ha sido RECHAZADA.

        Si tienes dudas o deseas más información, no dudes en contactarnos.

        El equipo de BuyTickets
        """

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = remitente
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(cuerpo, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, GMAIL_PASSWORD)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo de notificación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo de estado: {e}")

# Ruta para actualizar el estado de la solicitud
@solicitudes_bp.route('/actualizar-estado-solicitud', methods=['POST'])
def actualizar_estado_solicitud():
    data = request.get_json()
    solicitud_id = data.get("id")
    nuevo_estado = data.get("estado")

    if not solicitud_id or not nuevo_estado:
        return jsonify(success=False, message="Datos incompletos")

    try:
        # Obtener usuario vinculado a la solicitud
        cursor.execute("SELECT usuario FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify(success=False, message="Solicitud no encontrada")
        
        usuario = result["usuario"]

        # Actualizar el estado de la solicitud
        cursor.execute("UPDATE solicitudes_discapacidad SET estado = %s WHERE id = %s", (nuevo_estado, solicitud_id))

        # Cambiar campo discapacidad del usuario según el estado
        nuevo_valor_discapacidad = "sí" if nuevo_estado == "aprobada" else "no"
        cursor.execute("UPDATE users SET discapacidad = %s WHERE user = %s", (nuevo_valor_discapacidad, usuario))

         # Eliminar solicitud una vez se aprueba o rechaza
        cursor.execute("DELETE FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))

        db.commit()

        # Enviar correo al usuario
        cursor.execute("SELECT email FROM users WHERE user = %s", (usuario,))
        user_info = cursor.fetchone()
        email = user_info["email"] if user_info else None

        if email:
            enviar_correo_estado(email, usuario, nuevo_estado)

        return jsonify(success=True, message="Estado de la solicitud actualizado")

    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al actualizar el estado: " + str(err))

@solicitudes_bp.route('/estado-solicitud/<dni>', methods=['GET'])
def obtener_estado_solicitud(dni):
    try:
        cursor.execute("SELECT estado FROM solicitudes_discapacidad WHERE dni = %s", (dni,))
        result = cursor.fetchone()
        if result:
            return jsonify(success=True, estado=result["estado"])
        else:
            return jsonify(success=False, message="No se encontró la solicitud."), 404
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al consultar el estado: " + str(err)), 500

@solicitudes_bp.route('/estado-discapacidad/<user>', methods=['GET'])
def estado_discapacidad_usuario(user):
    try:
        # Verificar si el usuario existe y obtener su campo discapacidad
        cursor.execute("SELECT discapacidad FROM users WHERE user = %s", (user,))
        user_data = cursor.fetchone()

        if not user_data:
            return jsonify(success=False, message="Usuario no encontrado."), 404

        discapacidad = user_data['discapacidad']

        # Verificar si tiene solicitud pendiente en la tabla
        cursor.execute("SELECT estado FROM solicitudes_discapacidad WHERE usuario = %s", (user,))
        solicitud = cursor.fetchone()

        if solicitud:
            estado_solicitud = solicitud['estado']
            return jsonify(success=True, estado=estado_solicitud)

        # Si no hay solicitud, el valor viene de 'users.discapacidad'
        if discapacidad == "sí":
            return jsonify(success=True, estado="aprobada")
        else:
            return jsonify(success=True, estado="no solicitado")

    except Exception as e:
        print(f"❌ Error al consultar estado discapacidad: {e}")
        return jsonify(success=False, message="Error al consultar el estado de discapacidad."), 500