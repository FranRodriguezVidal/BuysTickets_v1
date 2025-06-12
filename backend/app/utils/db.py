import mysql.connector
from mysql.connector import Error  # Importa la clase Error para manejar errores de la base de datos
from config import Config

def connect():
    try:
        return mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            port=int(Config.DB_PORT),
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
    except Error as err:
        print(f"Error de conexión a la base de datos: {err}")
        raise  # Lanza el error para ser capturado más arriba

db = connect()
cursor = db.cursor(dictionary=True)

def ensure_connection():
    global db, cursor  # 🔁 ESTA LÍNEA DEBE IR PRIMERO
    try:
        db.ping(reconnect=True, attempts=5, delay=5)
    except Error as err:
        print(f"Error de conexión, intentando reconectar: {err}")
        db = connect()
        cursor = db.cursor(dictionary=True)

