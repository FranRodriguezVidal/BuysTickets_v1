import mysql.connector
from config import Config

db = mysql.connector.connect(
    host=Config.DB_HOST,
    user=Config.DB_USER,
    port=int(Config.DB_PORT),
    password=Config.DB_PASSWORD,
    database=Config.DB_NAME,
    ssl_disabled=True 
)

cursor = db.cursor(dictionary=True)
