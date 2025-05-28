import stripe
from flask import Blueprint, request, jsonify
from ..utils.db import cursor, db
from datetime import datetime, timedelta
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
premium_bp = Blueprint('premium', __name__)

@premium_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    user_id = data.get("user_id")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': 299,
                    'product_data': {
                        'name': 'Cuenta Premium',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url="http://localhost:3000/pago-exitoso?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/configuracion",
            metadata={'user_id': user_id}
        )
        return jsonify(url=checkout_session.url)
    except Exception as e:
        return jsonify(error=str(e)), 400

@premium_bp.route('/verify-payment', methods=['POST'])
def verify_payment():
    data = request.get_json()
    session_id = data.get('session_id')
    user_id = data.get('user_id')

    if not session_id or not user_id:
        return jsonify(success=False, message="Datos incompletos")

    try:
        # Verificar el pago con Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return jsonify(success=False, message="El pago no se completó")

        # Si el pago es exitoso, actualizar el usuario
        expiry_date = datetime.now() + timedelta(weeks=13)
        
        cursor.execute("""
            UPDATE users 
            SET role = 'premium', 
                subscription_expiry_date = %s 
            WHERE id = %s
            RETURNING id
        """, (expiry_date, user_id))
        
        db.commit()

        if cursor.rowcount > 0:
            return jsonify(
                success=True,
                expiry_date=expiry_date.strftime("%Y-%m-%d")
            )
        return jsonify(success=False, message="No se pudo actualizar el usuario")

    except stripe.error.StripeError as e:
        return jsonify(success=False, message=f"Error de Stripe: {str(e)}")
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
@premium_bp.route('/convert-to-premium', methods=['POST'])
def convert_to_premium():
    # Verificación básica de autenticación
    token = request.headers.get('Authorization')
    if not token:
        return jsonify(success=False, message="No autorizado"), 401
    
    try:
        user_id = request.json.get('user_id')
        expiry_date = datetime.now() + timedelta(weeks=13)  # 3 meses
        
        cursor.execute("""
            UPDATE users 
            SET role = 'premium', 
                subscription_expiry_date = %s 
            WHERE id = %s
        """, (expiry_date, user_id))
        
        db.commit()
        
        return jsonify(
            success=True,
            expiry_date=expiry_date.strftime("%Y-%m-%d")
        )
    
    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500