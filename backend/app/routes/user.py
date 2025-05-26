from flask import Blueprint, request, jsonify
from ..utils.db import cursor, db
from utils.helpers import hash_password, verify_password
from app.utils.mail import enviar_correo_eliminacion
import mimetypes
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from app.utils.db import cursor, db
import base64
import os
import random

user_bp = Blueprint('user', __name__)
UPLOAD_FOLDER = 'uploads'
reset_codes = {}  # Diccionario en memoria temporal

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('user')
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()

    if user_data and verify_password(user_data['password'], password):
        profile_base64 = None

        if user_data['profile']:
            # ⚠️ Convertir de bytes a string
            try:
                profile_filename = user_data['profile'].decode('utf-8')  # o 'latin-1' si tienes nombres con tildes
            except Exception as e:
                return jsonify(success=False, message="Error al decodificar el nombre de imagen de perfil.")

            profile_path = os.path.join(UPLOAD_FOLDER, profile_filename)

            if os.path.exists(profile_path):
                with open(profile_path, 'rb') as img_file:
                    mime_type, _ = mimetypes.guess_type(profile_path)
                    mime_type = mime_type or "image/png"  # fallback
                    profile_base64 = f"data:{mime_type};base64,{base64.b64encode(img_file.read()).decode('utf-8')}"

        return jsonify(
            success=True,
            nombre=user_data['name'],
            apellido=user_data['surname'],
            role=user_data['role'],
            profile=profile_base64,
            email=user_data['email']
        )

    return jsonify(success=False, message="Usuario o contraseña incorrectos.")


@user_bp.route('/verify-user', methods=['POST'])
def verify_user():
    user = request.get_json().get('user')
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    return jsonify(exists=bool(cursor.fetchone()))


@user_bp.route('/delete-user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    user, password = data.get('user'), data.get('password')

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()
    if not user_data or not verify_password(user_data['password'], password):
        return jsonify(success=False, message="Credenciales inválidas.")

    cursor.execute("DELETE FROM users WHERE user = %s", (user,))
    db.commit()

    if cursor.rowcount > 0 and user_data.get("email"):
        enviar_correo_eliminacion(user_data["email"], user)

    return jsonify(success=True, message="Cuenta eliminada.")

@user_bp.route('/update-user', methods=['POST'])
def update_user():
    data = request.form
    user = data.get('user')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    new_password = data.get('newPassword')
    profile = request.files.get('profile')

    if not user:
        return jsonify(success=False, message="Falta el nombre de usuario."), 400

    if new_password and not new_password.startswith("pbkdf2:"):
        hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')

    try:
        if nombre and apellido:
            cursor.execute("UPDATE users SET name=%s, surname=%s WHERE user=%s", (nombre, apellido, user))
        if email:
            cursor.execute("UPDATE users SET email=%s WHERE user=%s", (email, user))
        if hashed_password:
            cursor.execute("UPDATE users SET password=%s WHERE user=%s", (hashed_password, user))
        if profile:
            profile_data = profile.read()
            cursor.execute("UPDATE users SET profile=%s WHERE user=%s", (profile_data, user))

        db.commit()
        return jsonify(success=True, message="Datos actualizados correctamente.")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=f"Error: {str(e)}")

@user_bp.route('/send-recovery-code', methods=['POST'])
def send_recovery_code():
    data = request.get_json()
    user = data.get("user")

    cursor.execute("SELECT * FROM users WHERE user=%s", (user,))
    user_data = cursor.fetchone()

    if not user_data:
        return jsonify(success=False, message="Usuario no encontrado.")

    codigo = str(random.randint(10000000, 99999999))
    reset_codes[user] = codigo

    from app.utils.mail import enviar_codigo_recuperacion
    enviar_codigo_recuperacion(user_data["email"], user, codigo)

    return jsonify(success=True, message="Código enviado.")


@user_bp.route('/verify-recovery-code', methods=['POST'])
def verify_recovery_code():
    data = request.get_json()
    user = data.get("user")
    code = data.get("code")

    if reset_codes.get(user) == code:
        return jsonify(success=True)
    return jsonify(success=False, message="Código incorrecto o expirado.")


@user_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    user = data.get("user")
    new_password = data.get("new_password")

    hashed = generate_password_hash(new_password)

    try:
        cursor.execute("UPDATE users SET password=%s WHERE user=%s", (hashed, user))
        db.commit()

        cursor.execute("SELECT email FROM users WHERE user=%s", (user,))
        email_result = cursor.fetchone()
        if email_result:
            from app.utils.mail import enviar_notificacion_cambio
            enviar_notificacion_cambio(email_result["email"], user)

        if user in reset_codes:
            del reset_codes[user]

        return jsonify(success=True, message="Contraseña actualizada.")
    except Exception as e:
        return jsonify(success=False, message=f"Error al cambiar la contraseña: {str(e)}")
