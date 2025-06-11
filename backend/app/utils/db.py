import mysql.connector
from config import Config

def get_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        port=int(Config.DB_PORT),
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

def get_cursor():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    return db, cursor
