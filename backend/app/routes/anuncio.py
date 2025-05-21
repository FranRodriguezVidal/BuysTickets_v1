import mimetypes
from flask import Blueprint, request, jsonify
from io import BytesIO
from PIL import Image
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import smtplib
from app.utils.db import cursor

anuncio_bp = Blueprint('anucnio', __name__)

@anuncio_bp.route('/enviar-anuncio', methods=['POST'])
def enviar_anuncio():
    asunto = request.form.get('asunto')
    mensaje = request.form.get('mensaje')
    archivo = request.files.get('imagen')

    if not asunto:
        return jsonify(success=False, message="El asunto es obligatorio."), 400


    if not mensaje and not archivo:
        return jsonify(success=False, message="Por favor, ingresa un mensaje o carga una imagen."), 400

    imagen_mime = None
    archivo_nombre = None

    if archivo:
        archivo_nombre = archivo.filename
        archivo_bytes = archivo.read()

        tipo_mime, _ = mimetypes.guess_type(archivo_nombre)
        if not tipo_mime or not tipo_mime.startswith('image'):
            return jsonify(success=False, message="El archivo cargado no es una imagen válida."), 400

        try:
            imagen = Image.open(BytesIO(archivo_bytes))
            tipo_imagen = imagen.format.lower()
            imagen_mime = MIMEImage(archivo_bytes, _subtype=tipo_imagen, name=archivo_nombre)
            imagen_mime.add_header('Content-ID', '<imagen_cid>')
        except Exception as e:
            return jsonify(success=False, message=f"Error al procesar la imagen: {str(e)}"), 400

    try:
        cursor.execute("SELECT email, user FROM users WHERE role != 'admin'")
        usuarios = cursor.fetchall()
    except Exception as e:
        return jsonify(success=False, message=f"Error al consultar la base de datos: {str(e)}"), 500

    if not usuarios:
        return jsonify(success=False, message="No hay usuarios a los que enviar el anuncio."), 404

    for usuario in usuarios:
        destinatario = usuario['email']
        nombre_usuario = usuario['user']


        cuerpo = f"Hola {nombre_usuario},<br><br>{mensaje}<br><br>Atentamente, el equipo de BuyTickets."

        if imagen_mime:
            cuerpo = f"""
            <html>
                <body>
                    <p>Hola {nombre_usuario},</p>
                    <p>{mensaje}</p>
                    <img src="cid:imagen_cid" alt="Imagen del anuncio" style="max-width: 600px;" />
                    <p>Atentamente, el equipo de BuyTickets</p>
                </body>
            </html>
            """

        mensaje_correo = MIMEMultipart("related")
        mensaje_correo['From'] = "buystickets.customer@gmail.com"
        mensaje_correo['To'] = destinatario
        mensaje_correo['Subject'] = asunto

        mensaje_html = MIMEText(cuerpo, 'html', _charset="utf-8")
        mensaje_correo.attach(mensaje_html)

        if imagen_mime:
            mensaje_correo.attach(imagen_mime)

        try:
            servidor = smtplib.SMTP("smtp.gmail.com", 587)
            servidor.starttls()
            servidor.login("buystickets.customer@gmail.com", "ikch pecb cuzu dkdn")
            servidor.sendmail("buystickets.customer@gmail.com", destinatario, mensaje_correo.as_string())
            servidor.quit()
            print(f"✅ Correo enviado a {destinatario}")
        except Exception as e:
            print(f"❌ Error al enviar correo a {destinatario}: {e}")

    return jsonify(success=True, message="Anuncio enviado a todos los usuarios.")
