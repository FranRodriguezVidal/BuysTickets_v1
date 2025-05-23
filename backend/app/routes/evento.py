from flask import Blueprint, request, jsonify
from utils.db import db, cursor
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from mysql.connector import Error
from flask import send_from_directory

UPLOAD_FOLDER = "uploads/eventos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

eventos_bp = Blueprint('eventos', __name__)

@eventos_bp.route('/eventos', methods=['POST'])
def crear_evento():
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except Error as err:
        return jsonify(success=False, message=str(err)), 500

    data = request.form
    imagen = request.files.get("imagen")
    artista_nombre = data.get("artista_nombre")

    imagen_ruta = None
    if imagen:
        nombre_seguro = secure_filename(imagen.filename)
        ruta_completa = os.path.join(UPLOAD_FOLDER, nombre_seguro)
        imagen.save(ruta_completa)
        imagen_ruta = nombre_seguro  # solo se guarda el nombre del archivo, NO la ruta

    try:
        cursor.execute("SELECT id FROM artists WHERE nombre = %s", (artista_nombre,))
        artista = cursor.fetchone()
        if artista:
            artista_id = artista["id"]
        else:
            cursor.execute("INSERT INTO artists (nombre) VALUES (%s)", (artista_nombre,))
            artista_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO events (nombre_evento, fecha, lugar, artista_id, mayores_18, informacion, imagen, precio)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data["nombre_evento"],
            data["fecha"],
            data["lugar"],
            artista_id,
            data.get("mayores_18", "false") == "true",
            data.get("informacion", ""),
            imagen_ruta,  # ya está limpio
            float(data.get("precio", "0.00"))
        ))
        db.commit()
        return jsonify(success=True, message="Evento creado con artista.")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e))

@eventos_bp.route('/eventos', methods=['GET'])
def listar_eventos():
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
        cursor.execute("""
            SELECT e.*, a.nombre AS nombre_artista
            FROM events e
            JOIN artists a ON e.artista_id = a.id
            ORDER BY e.fecha DESC
        """)
        eventos = cursor.fetchall()
        return jsonify(success=True, eventos=eventos)
    except Exception as e:
        return jsonify(success=False, message=str(e))

@eventos_bp.route('/eventos/<int:evento_id>', methods=['DELETE'])
def eliminar_evento(evento_id):
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
        cursor.execute("DELETE FROM events WHERE id = %s", (evento_id,))
        db.commit()
        return jsonify(success=True, message="Evento eliminado")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e))

@eventos_bp.route('/eventos/<int:evento_id>', methods=['PUT'])
def editar_evento(evento_id):
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except Error as err:
        return jsonify(success=False, message=str(err)), 500

    data = request.get_json()
    nombre_artista = data.get("nombre_artista")

    if not nombre_artista:
        return jsonify(success=False, message="Falta el nombre del artista")

    try:
        cursor.execute("SELECT id FROM artists WHERE nombre = %s", (nombre_artista,))
        artista = cursor.fetchone()
        if artista:
            artista_id = artista["id"]
        else:
            cursor.execute("INSERT INTO artists (nombre) VALUES (%s)", (nombre_artista,))
            artista_id = cursor.lastrowid

        cursor.execute("""
            UPDATE events SET 
                nombre_evento = %s, 
                fecha = %s, 
                lugar = %s, 
                artista_id = %s, 
                mayores_18 = %s, 
                informacion = %s,
                precio = %s
            WHERE id = %s
        """, (
            data["nombre_evento"],
            data["fecha"],
            data["lugar"],
            artista_id,
            data.get("mayores_18", False),
            data.get("informacion", ""),
            float(data.get("precio", "0.00")),
            evento_id
        ))
        db.commit()
        return jsonify(success=True, message="Evento actualizado con artista.")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e))

@eventos_bp.route('/estadisticas', methods=['GET'])
def estadisticas_ventas():
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
        hoy = datetime.today().date()
        semana = hoy - timedelta(days=7)
        mes = hoy - timedelta(days=30)

        def contar_desde(fecha):
            with db.cursor(dictionary=True) as c:
                c.execute("""
                    SELECT COUNT(*) as cantidad, IFNULL(SUM(precio_total), 0) as total 
                    FROM tickets 
                    WHERE DATE(fecha_compra) >= %s
                """, (fecha,))
                return c.fetchone()

        return jsonify({
            "dia": contar_desde(hoy),
            "semana": contar_desde(semana),
            "mes": contar_desde(mes)
        })
    except Exception as e:
        return jsonify(success=False, message=f"Error al obtener estadísticas: {str(e)}"), 500

@eventos_bp.route('/comprar', methods=['POST'])
def comprar_tickets():
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
        data = request.get_json()
        user_id = data["user_id"]
        event_id = data["event_id"]
        tickets = data["tickets"]

        for e in tickets:
            cursor.execute("""
                INSERT INTO tickets (user_id, event_id, precio_total, asiento, nombre_comprador, email_comprador, fecha_compra)
                VALUES (%s, %s, %s, %s, %s, %s, CURDATE())
            """, (
                user_id,
                event_id,
                e["precio_total"],
                e["asiento"],
                e["nombre_comprador"],
                e["email_comprador"]
            ))
        db.commit()
        return jsonify(success=True, message="tickets compradas")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e))
    
@eventos_bp.route('/uploads/<filename>')
def serve_uploads(filename):
    return send_from_directory(os.path.abspath(UPLOAD_FOLDER), filename)