from flask import Blueprint, request, jsonify
from utils.db import db, cursor
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from mysql.connector import Error
import stripe
from flask import request
from flask import send_from_directory
from dotenv import load_dotenv
load_dotenv()

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
            INSERT INTO events (
                nombre_evento, fecha, lugar, artista_id, mayores_18,
                informacion, imagen, precio, tipo_espacio, aforo_total, entradas_vendidas
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
        """, (
            data["nombre_evento"],
            data["fecha"],
            data["lugar"],
            artista_id,
            data.get("mayores_18", "false") == "true",
            data.get("informacion", ""),
            imagen_ruta,
            float(data.get("precio", "0.00")),
            data.get("tipo_espacio", "normal"),
            int(data.get("aforo_total", "1000")),
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

        # Obtener datos del usuario
        cursor.execute("SELECT discapacidad, is_premium FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        discapacidad = user["discapacidad"]
        is_premium = user["is_premium"]

        # Obtener precio base del evento
        cursor.execute("SELECT aforo_total, entradas_vendidas, precio FROM events WHERE id = %s", (event_id,))
        event = cursor.fetchone()
        if not event or event["entradas_vendidas"] + len(tickets) > event["aforo_total"]:
            return jsonify(success=False, message="No hay suficientes entradas disponibles"), 400

        # Calcular descuento
        descuento = 0
        if discapacidad:
            descuento = 0.50
        elif is_premium:
            descuento = 0.25
        precio_final = float(event["precio"]) * (1 - descuento)

        for e in tickets:
            cursor.execute("""
                INSERT INTO tickets (user_id, event_id, precio_total, asiento, nombre_comprador, email_comprador, fecha_compra)
                VALUES (%s, %s, %s, %s, %s, %s, CURDATE())
            """, (
                user_id,
                event_id,
                precio_final,
                e["asiento"],
                e["nombre_comprador"],
                e["email_comprador"]
            ))
        # Añade esto justo antes de db.commit()
        cursor.execute("""
            UPDATE events SET entradas_vendidas = entradas_vendidas + %s
            WHERE id = %s
        """, (len(tickets), event_id))

        db.commit()
        return jsonify(success=True, message="tickets compradas", precio=precio_final, descuento=descuento)
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e))
    
@eventos_bp.route('/uploads/<filename>')
def serve_uploads(filename):
    return send_from_directory(os.path.abspath(UPLOAD_FOLDER), filename)

@eventos_bp.route('/favoritos', methods=['GET'])
def obtener_favoritos():
    cursor.execute("""
        SELECT f.*, e.nombre_evento, e.fecha, e.lugar, u.user AS nombre_usuario
        FROM favoritos f
        JOIN events e ON f.event_id = e.id
        JOIN users u ON f.user_id = u.id
    """)
    return jsonify(success=True, favoritos=cursor.fetchall())

@eventos_bp.route('/favoritos', methods=['POST'])
def agregar_favorito():
    data = request.get_json()
    cursor.execute("INSERT INTO favoritos (user_id, event_id) VALUES (%s, %s)", (data["user_id"], data["event_id"]))
    db.commit()
    return jsonify(success=True, message="Favorito agregado")



# ⚠️ Usa tu clave secreta de Stripe modo prueba (empieza con sk_test_)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@eventos_bp.route('/crear-checkout', methods=['POST'])
def crear_checkout():
    data = request.get_json()
    precio = data.get("precio", 1.00)
    evento = data.get("evento", "Entrada Evento")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",customer_email=data.get("email_comprador"),
            metadata={
                "user_id": data.get("user_id"),
                "event_id": data.get("event_id"),
                "asiento": data.get("asiento"),
                "nombre_comprador": data.get("nombre_comprador"),
                "email_comprador": data.get("email_comprador")
            },
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": evento},
                    "unit_amount": int(precio * 100),  # en céntimos
                },
                "quantity": 1,
            }],
            success_url=f"http://localhost:3000/entrada-generada?email={data.get('email_comprador')}&evento={data.get('evento')}",
            cancel_url="http://localhost:3000/cancel",
        )
        return jsonify(url=session.url)
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    
@eventos_bp.route('/asientos-ocupados/<int:event_id>', methods=['GET'])
def obtener_asientos_ocupados(event_id):
    try:
        # 🔐 Añade esto para asegurarte de consumir cualquier resultado pendiente
        db.ping(reconnect=True, attempts=3, delay=2)
        while cursor.nextset():  # ⬅️ fuerza a limpiar resultados anteriores si los hay
            pass

        cursor.execute("SELECT asiento FROM tickets WHERE event_id = %s", (event_id,))
        ocupados = [r['asiento'] for r in cursor.fetchall()]
        return jsonify(success=True, asientos=ocupados)
    except Exception as e:
        print("❌ Error al obtener asientos ocupados:", e)
        return jsonify(success=False, message=str(e)), 500

@eventos_bp.route("/stripe/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        return "Firma inválida", 400
    except Exception as e:
        return f"Error: {str(e)}", 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})

        try:
            cursor.execute("""
                INSERT INTO tickets (user_id, event_id, precio_total, asiento, nombre_comprador, email_comprador, fecha_compra)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (
                metadata["user_id"],
                metadata["event_id"],
                float(session["amount_total"]) / 100,
                metadata["asiento"],
                metadata["nombre_comprador"],
                metadata["email_comprador"]
            ))

            cursor.execute("""
                UPDATE events SET entradas_vendidas = entradas_vendidas + 1
                WHERE id = %s
            """, (metadata["event_id"],))
            db.commit()
            print("✅ Entrada registrada automáticamente.")
        except Exception as e:
            db.rollback()
            print("❌ Error al registrar entrada:", str(e))

    return "ok", 200

@eventos_bp.route('/tickets-por-email', methods=['GET'])
def ticket_por_email():
    email = request.args.get("email")
    evento = request.args.get("evento")

    cursor.execute("""
        SELECT t.*, e.nombre_evento
        FROM tickets t
        JOIN events e ON t.event_id = e.id
        WHERE t.email_comprador = %s AND e.nombre_evento = %s
        ORDER BY t.fecha_compra DESC LIMIT 1
    """, (email, evento))
    
    entrada = cursor.fetchone()
    if entrada:
        return jsonify(success=True, entrada=entrada)
    else:
        return jsonify(success=False, message="Entrada no encontrada")
    
@eventos_bp.route('/registrar-ticket-directo', methods=['POST'])
def registrar_ticket_directo():
    data = request.get_json()

    try:
        cursor.execute("""
            INSERT INTO tickets (user_id, event_id, precio_total, asiento, nombre_comprador, email_comprador, fecha_compra)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            data["user_id"],
            data["event_id"],
            data["precio_total"],
            data["asiento"],
            data["nombre_comprador"],
            data["email_comprador"]
        ))
        db.commit()
        return jsonify(success=True)
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
