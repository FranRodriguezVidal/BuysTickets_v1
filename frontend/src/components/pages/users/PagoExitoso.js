import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

export default function PagoExitoso() {
    const { usuario, setUsuario } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
    if (!usuario?.id) return; // No ejecutar si no está logueado

    const convertirPremium = async () => {
        try {
            const res = await fetch("http://localhost:5000/convert-to-premium", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ user_id: usuario.id })
            });

            const data = await res.json();
            
            if (data.success) {
                setUsuario(prev => ({
                    ...prev,
                    role: "premium",
                    subscription_expiry_date: data.expiry_date
                }));
                setTimeout(() => navigate("/configuracion"), 1500);
            } else {
                navigate("/configuracion", { state: { error: data.message } });
            }
        } catch (error) {
            navigate("/configuracion", { state: { error: "Error de conexión" } });
        }
    };

    convertirPremium();
}, [usuario, setUsuario, navigate]);

    return (
        <div className="container mt-5 text-center">
            <h2 className="text-success">¡Gracias por tu compra!</h2>
            <p className="mt-3">Activando tu cuenta premium...</p>
        </div>
    );
}