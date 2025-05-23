from flask import Flask
from .routes.user import user_bp
from .routes.auth import auth_bp
from .routes.premium import premium_bp
from .routes.solicitudes import solicitudes_bp
from .routes.reportes import reportes_bp
from .routes.admin_control import admin_bp
from .routes.anuncio import anuncio_bp
from flask_cors import CORS
from .routes.evento import eventos_bp
import os
from flask import send_from_directory

def create_app():
    app = Flask(__name__)
    CORS(app)  # ← Esto es importante

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(premium_bp)
    app.register_blueprint(solicitudes_bp, url_prefix='/solicitudes')
    app.register_blueprint(reportes_bp, url_prefix='/reportes')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(anuncio_bp,url_prefix='/anuncios')
    app.register_blueprint(eventos_bp)

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)


    return app
