import os

class Config:
    UPLOAD_FOLDER = 'uploads/'
    DB_HOST = os.getenv('DB_HOST', 'turntable.proxy.rlwy.net')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'bFEzIjMzYzTCrrmgdWWdOkFowAQxLyGE')
    DB_NAME = os.getenv('DB_NAME', 'railway')
