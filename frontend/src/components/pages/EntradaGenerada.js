import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useSearchParams } from "react-router-dom";

export default function EntradaGenerada() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const evento = searchParams.get("evento");
    const [entrada, setEntrada] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/tickets-por-email?email=${email}&evento=${evento}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.entrada) {
                    setEntrada(data.entrada);
                }
            });
    }, [email, evento]);

    if (!entrada) return <p>Cargando entrada...</p>;

    const qrValue = JSON.stringify({
        evento: entrada.nombre_evento,
        asiento: entrada.asiento,
        nombre: entrada.nombre_comprador,
        email: entrada.email_comprador,
        fecha: entrada.fecha_compra
    });

    return (
        <div className="container text-center mt-5">
            <h2>🎟️ Entrada generada correctamente</h2>
            <p>Evento: <strong>{entrada.nombre_evento}</strong></p>
            <p>Asiento: <strong>{entrada.asiento}</strong></p>
            <p>Fecha: <strong>{entrada.fecha_compra}</strong></p>
            <div className="d-flex justify-content-center mt-4">
                <QRCode value={qrValue} />
            </div>
        </div>
    );
}
