import mysql.connector
from config import Config

def connect():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        port=int(Config.DB_PORT),
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

db = connect()
cursor = db.cursor(dictionary=True)

def ensure_connection():
    global db, cursor  # 🔁 ESTA LÍNEA DEBE IR PRIMERO
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except:
        db = connect()
        cursor = db.cursor(dictionary=True)
