import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useEffect, useState } from "react";

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/eventos")
            .then(res => res.json())
            .then(data => {
                if (data.success) setEventos(data.eventos);
            });
    }, []);

    function verMas(id) {
        const evento = eventos.find(e => e.id === id);
        setEventoSeleccionado(evento);
        const modal = new window.bootstrap.Modal(document.getElementById("modalCompra"));
        modal.show();
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5 text-primary">🎫 Eventos Disponibles</h1>
            <div className="row g-4">
                {eventos.map(ev => (
                    <div key={ev.id} className="col-12">
                        <div
                            className="card shadow-sm d-flex flex-row align-items-start p-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => verMas(ev.id)}
                        >
                            {/* Imagen vertical tipo A4 */}
                            {ev.imagen ? (
                                <img
                                    src={`http://localhost:5000/uploads/${ev.imagen.replace(/^.*[\\/]/, '')}`}
                                    alt={ev.nombre_evento}
                                    style={{
                                        width: "150px",
                                        height: "220px",
                                        objectFit: "cover",
                                        borderRadius: "8px"
                                    }}
                                    className="me-3"
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "150px",
                                        height: "220px",
                                        backgroundColor: "#eee",
                                        borderRadius: "8px"
                                    }}
                                    className="me-3 d-flex justify-content-center align-items-center text-muted"
                                >
                                    Sin imagen
                                </div>
                            )}

                            {/* Info del evento */}
                            <div className="flex-grow-1">
                                <h5 className="mb-1">{ev.nombre_evento}</h5>
                                <p className="mb-1"><strong>📍 Lugar:</strong> {ev.lugar}</p>
                                <p className="mb-1"><strong>🎤 Artista:</strong> {ev.nombre_artista}</p>
                                <p className="mb-0 text-success"><strong>💶 Precio:</strong> {Number(ev.precio).toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de información */}
            <div className="modal fade" id="modalCompra" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        {eventoSeleccionado && (
                            <>
                                <div className="modal-header">
                                    <h5 className="modal-title">{eventoSeleccionado.nombre_evento}</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>📅 Fecha:</strong> {eventoSeleccionado.fecha}</p>
                                    <p><strong>📍 Lugar:</strong> {eventoSeleccionado.lugar}</p>
                                    <p><strong>🎤 Artista:</strong> {eventoSeleccionado.nombre_artista}</p>
                                    <p>{eventoSeleccionado.informacion}</p>
                                    <p><strong>💶 Precio:</strong> {Number(eventoSeleccionado.precio).toFixed(2)} €</p>
                                    {eventoSeleccionado.mayores_18 && (
                                        <p className="text-danger">🔞 Requiere ser mayor de 18 años</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            alert("Proceso de compra no implementado aún");
                                        }}
                                    >
                                        Confirmar Compra
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
