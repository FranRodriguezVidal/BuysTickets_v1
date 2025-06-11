from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from utils.db import cursor, db
from werkzeug.security import generate_password_hash
import os
import base64
import mysql.connector 
from app.utils.mail import enviar_correo_eliminacion

# Configuración
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

admin_bp = Blueprint('admin_bp', __name__)

# ==========================
# 📌 **1️⃣ Registrar Usuario**
# ==========================
@admin_bp.route('/register-adminControl', methods=['POST'])
def register_adminControl():
    user = request.form.get('user')
    password = request.form.get('password')
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    email = request.form.get('email')
    role = request.form.get('role', 'estandar')
    discapacidad = request.form.get('discapacidad', 'no')
    profile = request.files.get('profile')

    if not all([user, password, nombre, apellido, email]):
        return jsonify(success=False, message="Faltan datos obligatorios."), 400

    # Validación de duplicados
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    if cursor.fetchone():
        return jsonify(success=False, message="El nombre de usuario ya está en uso.")
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify(success=False, message="Este correo ya está registrado.")

    # Guardar imagen si se sube
    profile_filename = None
    if profile:
        profile_filename = secure_filename(profile.filename)
        profile.save(os.path.join(UPLOAD_FOLDER, profile_filename))

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        cursor.execute(
            """
            INSERT INTO users (user, password, name, surname, email, role, discapacidad, profile)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (user, hashed_password, nombre, apellido, email, role, discapacidad, profile_filename)
        )
        db.commit()
        return jsonify(success=True, message="Usuario creado exitosamente.")
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al registrar el usuario: " + str(err))

# ==========================
# 📌 **2️⃣ Obtener Usuarios**
# ==========================
@admin_bp.route('/lista-usuarios-adminControl', methods=['GET'])
def lista_usuarios_adminControl():
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, user, role, name, surname, email, discapacidad, profile FROM users")
        users = cursor.fetchall()
        cursor.close()

        if not users:
            return jsonify(success=False, message="No se encontraron usuarios.")

        for user in users:
            profile_value = user.get('profile')

            if isinstance(profile_value, bytes):
                try:
                    profile_value = profile_value.decode('utf-8')
                except UnicodeDecodeError:
                    profile_value = None

            if profile_value and profile_value != 'None':
                profile_path = os.path.join(UPLOAD_FOLDER, profile_value)
                if os.path.exists(profile_path):
                    with open(profile_path, "rb") as image_file:
                        user['profile'] = base64.b64encode(image_file.read()).decode('utf-8')
                else:
                    user['profile'] = None
            else:
                user['profile'] = None

        return jsonify(success=True, usuarios=users)

    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener la lista de usuarios: {err}")


# ==========================
# 📌 **3️⃣ Actualizar Usuario** (incluye cambio de contraseña)
# ==========================
@admin_bp.route('/update-user-adminControl', methods=['POST'])
def update_user_adminControl():
    data = request.form
    user_id = data.get('id')
    if not user_id:
        return jsonify(success=False, message="ID de usuario no proporcionado."), 400

    user = data.get('user')
    password = data.get('password')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    role = data.get('role')
    discapacidad = data.get('discapacidad')

    profile = request.files.get('profile')

    try:
        if user:
            cursor.execute("UPDATE users SET user = %s WHERE id = %s", (user, user_id))
        if password:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        if nombre:
            cursor.execute("UPDATE users SET name = %s WHERE id = %s", (nombre, user_id))
        if apellido:
            cursor.execute("UPDATE users SET surname = %s WHERE id = %s", (apellido, user_id))
        if email:
            cursor.execute("UPDATE users SET email = %s WHERE id = %s", (email, user_id))
        if role:
            cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
        if discapacidad:
            cursor.execute("UPDATE users SET discapacidad = %s WHERE id = %s", (discapacidad, user_id))

        if profile:
            profile_filename = secure_filename(profile.filename)
            profile.save(os.path.join(UPLOAD_FOLDER, profile_filename))
            cursor.execute("UPDATE users SET profile = %s WHERE id = %s", (profile_filename, user_id))

        db.commit()
        return jsonify(success=True, message="Usuario actualizado exitosamente.")
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al actualizar el usuario: " + str(err))


# ==========================
# 📌 **4️⃣ Eliminar Usuario**
# ==========================
@admin_bp.route('/delete-user-adminControl/<int:user_id>', methods=['DELETE'])
def delete_user_adminControl(user_id):
    try:
        cursor.execute("SELECT user, email, profile FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify(success=False, message="Usuario no encontrado.")

        profile = user.get("profile")
        if profile and isinstance(profile, str):
            profile_path = os.path.join(UPLOAD_FOLDER, profile)
            if os.path.exists(profile_path):
                os.remove(profile_path)

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()

        if cursor.rowcount > 0 and user.get("email"):
            enviar_correo_eliminacion(user["email"], user["user"])

        return jsonify(success=True, message="Usuario eliminado exitosamente.")
    except Exception as err:
        db.rollback()
        return jsonify(success=False, message="Error al eliminar el usuario: " + str(err))
