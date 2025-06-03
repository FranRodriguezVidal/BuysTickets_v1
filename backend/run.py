import sys
import os

# Agregar la carpeta 'app' al sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
