import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import qrcode
from io import BytesIO
import base64
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
def enviar_correo_eliminacion(destinatario, nombre_usuario):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Cuenta eliminada"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""Hola {nombre_usuario},

Tu cuenta ha sido eliminada correctamente de BuyTickets.

Si no realizaste esta acción o tienes dudas, por favor contáctanos.

Atentamente,
El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")

def enviar_codigo_recuperacion(destinatario, nombre_usuario, codigo):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Código de recuperación de contraseña"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""
Hola {nombre_usuario},

Has solicitado recuperar tu contraseña. Este es tu código de verificación:

🔐 Código: {codigo}

Si no solicitaste este cambio, ignora este mensaje.

El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Código de recuperación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar el código: {e}")

def enviar_notificacion_cambio(destinatario, nombre_usuario):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Contraseña cambiada"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""
Hola {nombre_usuario},

Tu contraseña ha sido cambiada correctamente.

Si no realizaste este cambio, contacta con nosotros inmediatamente.

El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo de confirmación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo de confirmación: {e}")

def enviar_qr_por_email(destinatario, entrada):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación Gmail

    # Generar datos del QR
    qr_data = {
        "evento": entrada["nombre_evento"],
        "asiento": entrada["asiento"],
        "nombre": entrada["nombre_comprador"],
        "email": entrada["email_comprador"],
        "fecha": entrada["fecha_compra"]
    }

    # Crear QR
    qr = qrcode.make(str(qr_data))
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    qr_image = buffer.read()

    # Crear mensaje
    mensaje = MIMEMultipart("related")
    mensaje["Subject"] = f"🎟️ Tu entrada para {entrada['nombre_evento']}"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    # Cuerpo del correo
    cuerpo = f"""
    <html>
      <body>
        <p>Hola {entrada['nombre_comprador']},</p>
        <p>Adjunto encontrarás el código QR de tu entrada para el evento <b>{entrada['nombre_evento']}</b>.</p>
        <ul>
          <li><b>Asiento:</b> {entrada['asiento']}</li>
          <li><b>Fecha:</b> {entrada['fecha_compra']}</li>
        </ul>
        <p>¡Gracias por tu compra! 🎉</p>
        <p><img src="cid:qrimage"></p>
      </body>
    </html>
    """

    mensaje_alternativo = MIMEMultipart("alternative")
    mensaje.attach(mensaje_alternativo)
    mensaje_alternativo.attach(MIMEText(cuerpo, "html"))

    # Adjuntar QR como imagen embebida
    imagen = MIMEImage(qr_image, name="entrada_qr.png")
    imagen.add_header("Content-ID", "<qrimage>")
    imagen.add_header("Content-Disposition", "inline", filename="entrada_qr.png")
    mensaje.attach(imagen)

    # Enviar correo
    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ QR enviado correctamente a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar el QR: {e}")
