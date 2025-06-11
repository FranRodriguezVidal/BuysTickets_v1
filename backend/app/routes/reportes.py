from flask import Blueprint, jsonify, request
import mysql.connector
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
from app.utils.db import get_cursor

db, cursor = get_cursor()

# Configuración de la contraseña de Gmail desde una variable de entorno
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
REMITENTE = "buystickets.customer@gmail.com"

# Definición del Blueprint
reportes_bp = Blueprint('reportes', __name__)

# ==============================
# 📌 **1️⃣ Crear un nuevo reporte**
# ==============================
@reportes_bp.route('/reportar-error', methods=['POST'])
def reportar_error():
    data = request.get_json()
    
    usuario = data.get('user')
    reporte = data.get('reporte')
    
    if not usuario or not reporte:
        return jsonify(success=False, message="Faltan datos obligatorios."), 400
    
    try:
        # 👉 Crear la tabla reportes si no existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reportes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(255) NOT NULL,
                reporte TEXT NOT NULL,
                estado VARCHAR(50) DEFAULT 'pendiente',
                fecha_creacion DATETIME DEFAULT NOW()
            )
        """)
        
        # 👉 Insertar el nuevo reporte con valores por defecto
        cursor.execute("""
            INSERT INTO reportes (usuario, reporte)
            VALUES (%s, %s)
        """, (usuario, reporte))
        
        db.commit()
        return jsonify(success=True, message="Reporte enviado correctamente."), 201

    except mysql.connector.Error as err:
        db.rollback()
        print(f"❌ Error SQL al guardar el reporte: {err}")
        return jsonify(success=False, message=f"Error al guardar el reporte: {str(err)}"), 500

# ==============================
# 📌 **2️⃣ Obtener reportes**
# ==============================

@reportes_bp.route('/reportar-obtener', methods=['GET'])
def obtener_reportes():

    estado = request.args.get('estado')

    try:
        if estado:
            cursor.execute("SELECT * FROM reportes WHERE estado = %s", (estado,))
        else:
            cursor.execute("SELECT * FROM reportes")

        reportes = cursor.fetchall()

        if not reportes:
            return jsonify(success=False, message="No hay reportes disponibles.")

        # Formatear los datos
        reportes_data = [
            {
                "id": r["id"],
                "usuario": r["usuario"],
                "reporte": r["reporte"],
                "estado": r["estado"],
                "fecha_creacion": r["fecha_creacion"].strftime('%Y-%m-%d %H:%M:%S')
            } for r in reportes
        ]

        return jsonify(success=True, reportes=reportes_data), 200

    except mysql.connector.Error as err:
        print(f"❌ Error SQL al obtener los reportes: {err}")
        return jsonify(success=False, message=f"Error al obtener los reportes: {str(err)}"), 500
# ==============================
# 📌 **3️⃣ Actualizar estado del reporte**
# ==============================
@reportes_bp.route('/actualizar-reporte', methods=['POST'])
def actualizar_reporte():
    data = request.get_json()
    
    reporte_id = data.get('id')
    nuevo_estado = data.get('estado')
    
    if not reporte_id or not nuevo_estado:
        return jsonify(success=False, message="Faltan datos obligatorios."), 400
    
    if nuevo_estado not in ['pendiente', 'arreglada', 'resuelta', 'eliminado']:
        return jsonify(success=False, message="Estado inválido."), 400
    
    try:
        if nuevo_estado == 'eliminado':
            # 🗑️ Eliminar el reporte directamente
            cursor.execute("DELETE FROM reportes WHERE id = %s", (reporte_id,))
        else:
            # ✅ Actualizar el estado
            cursor.execute("UPDATE reportes SET estado = %s WHERE id = %s", (nuevo_estado, reporte_id))
        
        db.commit()

        if cursor.rowcount == 0:
            return jsonify(success=False, message="Reporte no encontrado."), 404

        return jsonify(success=True, message="Actualización exitosa."), 200

    except mysql.connector.Error as err:
        db.rollback()
        print(f"❌ Error SQL: {err}")
        return jsonify(success=False, message=f"Error: {str(err)}"), 500


# ==============================
# 📌 **4️⃣ Enviar correo de estado**
# ==============================
@reportes_bp.route('/enviar-correo-estado', methods=['POST'])
def enviar_correo_estado():
    data = request.get_json()
    usuario = data.get('usuario')
    estado = data.get('estado')
    mensaje_admin = data.get('mensaje', '')

    if not usuario or not estado:
        return jsonify(success=False, message="Faltan datos obligatorios."), 400

    # Buscar email del usuario
    try:
        cursor.execute("SELECT email FROM users WHERE user = %s", (usuario,))
        user_data = cursor.fetchone()
    except Exception as db_error:
        return jsonify(success=False, message="Error al buscar el usuario en la base de datos."), 500

    if not user_data:
        return jsonify(success=False, message="Usuario no encontrado."), 404

    email = user_data["email"]
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # tu contraseña de aplicación fija

    asunto = f"Estado de tu reporte: {estado.capitalize()}"
    cuerpo = f"""
Hola {usuario},

Tu reporte ha sido actualizado a estado: **{estado.upper()}**

📩 Mensaje del equipo:
{mensaje_admin if mensaje_admin else '(sin mensaje adicional)'}

Gracias por utilizar BuyTickets.
"""

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = remitente
    mensaje["To"] = email
    mensaje.attach(MIMEText(cuerpo, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, email, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo enviado a {email}")
        return jsonify(success=True, message="Correo enviado correctamente."), 200
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")
        return jsonify(success=False, message=f"Error al enviar el correo: {str(e)}"), 500
