import mysql.connector
from config import Config

def get_connection():
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            port=int(Config.DB_PORT),
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.ping(reconnect=True, attempts=3, delay=2)  # 🔁 Reconectar si se cayó
        return conn
    except mysql.connector.Error as err:
        print("❌ Error al conectar con la base de datos:", err)
        return None

def get_cursor(conn):
    try:
        return conn.cursor(dictionary=True)
    except mysql.connector.Error as err:
        print("❌ Error al obtener cursor:", err)
        return None
