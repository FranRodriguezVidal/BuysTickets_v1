import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";



export default function EntradaGenerada() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const evento = searchParams.get("evento");
    const [entrada, setEntrada] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!email || !evento) return;

        fetch(`http://localhost:5000/tickets-por-email?email=${email}&evento=${evento}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.entrada) {
                    setEntrada(data.entrada);
                } else {
                    console.warn("Entrada no encontrada:", data.message);
                }
            })
            .catch(err => console.error("Error al buscar entrada:", err));
    }, [email, evento]);

    if (!entrada) return <p className="text-center mt-5">🎫 Cargando entrada...</p>;

    const descargarQR = async () => {
        const qrData = {
            evento: entrada.nombre_evento,
            asiento: entrada.asiento,
            nombre: entrada.nombre_comprador,
            email: entrada.email_comprador,
            fecha: entrada.fecha_compra,
        };

        try {
            // Cargar QR como base64
            const qrBase64 = await QRCode.toDataURL(JSON.stringify(qrData));

            const doc = new jsPDF();
            doc.setDrawColor(0);
            doc.setFillColor(245, 245, 245);
            doc.rect(10, 10, 190, 277, "F");

            doc.setFontSize(16);
            doc.setTextColor(40, 40, 150);
            doc.setFont("helvetica", "bold");
            doc.text("Entrada Oficial - BuysTickets", 105, 40, null, null, "center");

            doc.setFontSize(13);
            doc.setTextColor(0);
            doc.setFont("helvetica", "normal");
            doc.text("Detalles de tu entrada", 105, 48, null, null, "center");

            doc.setDrawColor(100, 100, 255);
            doc.line(20, 52, 190, 52);

            const y = 65;
            const espacio = 10;
            doc.setFontSize(12);
            doc.setTextColor(30);
            doc.text(`Evento: ${entrada.nombre_evento}`, 25, y);
            doc.text(`Asiento: ${entrada.asiento}`, 25, y + espacio);
            doc.text(`Nombre: ${entrada.nombre_comprador}`, 25, y + espacio * 2);
            doc.text(`Email: ${entrada.email_comprador}`, 25, y + espacio * 3);
            doc.text(`Fecha de compra: ${entrada.fecha_compra}`, 25, y + espacio * 4);

            doc.setFontSize(11);
            doc.text("Escanea este código para validar tu entrada:", 105, y + espacio * 6, null, null, "center");
            doc.addImage(qrBase64, "PNG", 60, y + espacio * 6 + 5, 90, 90);

            doc.setDrawColor(180);
            doc.line(20, 270, 190, 270);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Preséntalo en la entrada. No es necesario imprimir.", 105, 277, null, null, "center");

            doc.save("entrada_buytickets.pdf");
        } catch (error) {
            console.error("❌ Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF con tu entrada.");
        }
    };


    return (
        <div className="container text-center mt-5">
            <h2>🎟️ Entrada comprada existosa</h2>
            <p><strong>Evento:</strong> {entrada.nombre_evento}</p>
            <p><strong>Asiento:</strong> {entrada.asiento}</p>
            <p><strong>Fecha:</strong> {entrada.fecha_compra}</p>

            <div className="d-flex justify-content-center mt-4">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        JSON.stringify({
                            evento: entrada.nombre_evento,
                            asiento: entrada.asiento,
                            nombre: entrada.nombre_comprador,
                            email: entrada.email_comprador,
                            fecha: entrada.fecha_compra
                        })
                    )}&size=200x200`}
                    alt="Código QR"
                />
            </div>

            <button className="btn btn-outline-primary mt-4" onClick={descargarQR}>
                ⬇️ Descargar entrada en PDF
            </button>

            <p className="mt-3">
                ¿Has comprado más entradas? Puedes verlas todas en Mis Entradas.
            </p>
            <button className="btn btn-info my-2" onClick={() => navigate("/entradas")}>
                Ir a Mis Entradas
            </button>

        </div>
    );
}
