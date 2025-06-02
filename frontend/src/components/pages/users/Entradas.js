import { jsPDF } from "jspdf";
import QRCodeLib from "qrcode";
import { useContext, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import QRCode from "react-qr-code";
import { UserContext } from "../../../context/UserContext";

export default function Entradas() {
    const [entradas, setEntradas] = useState([]);
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { usuario } = useContext(UserContext);

    const nombreComprador = `${usuario?.nombre} ${usuario?.apellido}`;

    useEffect(() => {
        if (!nombreComprador) return;

        fetch(`http://localhost:5000/entradas?nombre_comprador=${encodeURIComponent(nombreComprador)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setEntradas(data.entradas || []);
            })
            .catch(err => console.error("Error cargando entradas:", err));
    }, [nombreComprador]);

    const abrirModal = (entrada) => {
        setEntradaSeleccionada(entrada);
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEntradaSeleccionada(null);
    };

    const descargarQR = async () => {
    const e = entradaSeleccionada;
    if (!e) return;

    const qrData = {
        evento: e.nombre_evento,
        asiento: e.asiento,
        nombre: e.nombre_comprador,
        email: e.email_comprador,
        fecha: e.fecha_compra,
    };

    try {
        const qrBase64 = await QRCodeLib.toDataURL(JSON.stringify(qrData));
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
        doc.text(`Evento: ${e.nombre_evento}`, 25, y);
        doc.text(`Asiento: ${e.asiento}`, 25, y + espacio);
        doc.text(`Nombre: ${e.nombre_comprador}`, 25, y + espacio * 2);
        doc.text(`Email: ${e.email_comprador}`, 25, y + espacio * 3);
        doc.text(`Fecha de compra: ${e.fecha_compra}`, 25, y + espacio * 4);

        doc.setFontSize(11);
        doc.text("Escanea este código para validar tu entrada:", 105, y + espacio * 6, null, null, "center");
        doc.addImage(qrBase64, "PNG", 60, y + espacio * 6 + 5, 90, 90);

        doc.setDrawColor(180);
        doc.line(20, 270, 190, 270);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Preséntalo en la entrada. No es necesario imprimir.", 105, 277, null, null, "center");

        doc.save("entrada_buytickets.pdf");
    } catch (err) {
        console.error("❌ Error al generar el PDF:", err);
        alert("Hubo un error al generar el PDF.");
    }
};


    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">🎟️ Mis Entradas</h1>

            {entradas.length === 0 && (
                <div className="alert alert-info text-center">
                    No tienes entradas registradas.
                </div>
            )}

            <div className="row">
                {entradas.map((e, i) => (
                    <div key={i} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="card-title">{e.nombre_evento}</h5>
                                <p><strong>Fecha:</strong> {e.fecha}</p>
                                <p><strong>Asiento:</strong> {e.asiento}</p>
                                <Button variant="primary" onClick={() => abrirModal(e)}>
                                    Ver entrada completa
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={cerrarModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Entrada</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {entradaSeleccionada && (
                        <>
                            <h5>{entradaSeleccionada.nombre_evento}</h5>
                            <p><strong>Fecha:</strong> {entradaSeleccionada.fecha}</p>
                            <p><strong>Asiento:</strong> {entradaSeleccionada.asiento}</p>
                            <p><strong>Comprador:</strong> {entradaSeleccionada.nombre_comprador}</p>
                            <p><strong>Email:</strong> {entradaSeleccionada.email_comprador}</p>
                            <div className="d-flex justify-content-center my-3">
                                <QRCode
                                    value={JSON.stringify({
                                        evento: entradaSeleccionada.nombre_evento,
                                        asiento: entradaSeleccionada.asiento,
                                        nombre: entradaSeleccionada.nombre_comprador,
                                        email: entradaSeleccionada.email_comprador,
                                        fecha: entradaSeleccionada.fecha_compra
                                    })}
                                    size={180}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
                    <Button variant="success" onClick={descargarQR}>⬇️ Descargar en PDF</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
