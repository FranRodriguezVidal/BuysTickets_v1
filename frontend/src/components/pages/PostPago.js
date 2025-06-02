import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PostPago() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const email = queryParams.get("email");
    const evento = queryParams.get("evento");
    const nombre_completo = queryParams.get("nombre_completo");


    const [comprando, setComprando] = useState(false);

    const registrarEntrada = async () => {
        setComprando(true);
        try {
            const res = await fetch("http://localhost:5000/comprar-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    nombre_comprador: nombre_completo || "Invitado",
                    nombre_evento: evento,
                    event_id: null
                })

            });

            const data = await res.json();
            if (data.success) {
                navigate(`/entrada-generadan?email=${encodeURIComponent(data.email)}&evento=${encodeURIComponent(data.evento)}`);
            } else {
                alert("❌ Error al registrar entrada: " + data.message);
                setComprando(false);
            }
        } catch (err) {
            alert("❌ Error inesperado al conectar con el servidor.");
            console.error(err);
            setComprando(false);
        }
    };

    return (
        <div className="container text-center mt-5">
            <h2>Pago confirmado por Stripe</h2>
            <p>Gracias por tu compra.</p>

            <button
                className="btn btn-success my-4"
                onClick={registrarEntrada}
                disabled={comprando}
            >
                {comprando ? "⏳ Registrando entrada..." : "🎟️ Comprar y ver entrada"}
            </button>
        </div>
    );
}
