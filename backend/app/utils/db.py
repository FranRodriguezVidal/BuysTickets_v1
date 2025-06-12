# app/utils/db.py
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
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except:
        global db, cursor
        db = connect()
        cursor = db.cursor(dictionary=True)
