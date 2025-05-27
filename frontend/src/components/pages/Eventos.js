import { loadStripe } from '@stripe/stripe-js';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const stripePromise = loadStripe("pk_test_...");
    const { usuario } = useContext(UserContext);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const busqueda = queryParams.get("search")?.toLowerCase() || "";
    const [tiposEspacioSeleccionados, setTiposEspacioSeleccionados] = useState([]);
    const [soloMayores, setSoloMayores] = useState(false);
    const [precioMinimo, setPrecioMinimo] = useState(0);
    const [precioMaximo, setPrecioMaximo] = useState(1000); // cambiará tras cargar eventos
    const [rangoPrecio, setRangoPrecio] = useState([0, 1000]);

    useEffect(() => {
        fetch("http://localhost:5000/eventos")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEventos(data.eventos);

                    // Calculamos rango de precios
                    const precios = data.eventos.map(ev => Number(ev.precio));
                    const min = Math.min(...precios);
                    const max = Math.max(...precios);

                    setPrecioMinimo(min);
                    setPrecioMaximo(max);
                    setRangoPrecio([min, max]);
                }
            });
    }, []);

    async function iniciarPago(evento) {
        const base = Number(evento.precio);
        const user = {
            is_premium: usuario?.is_premium || false,
            discapacidad: usuario?.discapacidad || false
        };

        let descuento = 0;
        if (user.discapacidad) {
            descuento = 0.50;
        } else if (user.is_premium) {
            descuento = 0.25;
        }

        const precioFinal = base * (1 - descuento);

        const res = await fetch("http://localhost:5000/crear-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                precio: precioFinal,
                evento: evento.nombre_evento
            })
        });

        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Error al iniciar el pago: " + data.message);
        }
    }

    function verMas(id) {
        const evento = eventos.find(e => e.id === id);
        setEventoSeleccionado(evento);
        const modal = new window.bootstrap.Modal(document.getElementById("modalCompra"));
        modal.show();
    }

    const toggleTipoEspacio = (tipo) => {
        setTiposEspacioSeleccionados(prev =>
            prev.includes(tipo)
                ? prev.filter(t => t !== tipo)
                : [...prev, tipo]
        );
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5 text-primary">🎫 Eventos Disponibles</h1>
            <div className="mb-4">
                <h5 className="mb-3">🔎 Filtrar eventos:</h5>

                <Form.Label>💶 Rango de precio:</Form.Label>
                <div className="d-flex gap-2 align-items-center mb-3">
                    <Form.Control
                        type="number"
                        min={precioMinimo}
                        max={precioMaximo}
                        value={rangoPrecio[0]}
                        onChange={(e) => setRangoPrecio([Number(e.target.value), rangoPrecio[1]])}
                    />
                    <span> - </span>
                    <Form.Control
                        type="number"
                        min={precioMinimo}
                        max={precioMaximo}
                        value={rangoPrecio[1]}
                        onChange={(e) => setRangoPrecio([rangoPrecio[0], Number(e.target.value)])}
                    />
                    <span>€</span>
                </div>

                <Form.Check
                    type="checkbox"
                    label="🔞 Solo mayores de 18"
                    className="mb-2"
                    onChange={(e) => setSoloMayores(e.target.checked)}
                    checked={soloMayores}
                />

                <div className="mt-3">
                    <strong>🧍‍♂️ Tipo de espacio:</strong>
                    <div className="d-flex flex-wrap gap-3 mt-2">
                        {["normal", "teatro", "estadio"].map(tipo => (
                            <Form.Check
                                key={tipo}
                                type="checkbox"
                                label={tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                onChange={() => toggleTipoEspacio(tipo)}
                                checked={tiposEspacioSeleccionados.includes(tipo)}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-3">
                    <button className="btn btn-outline-danger" onClick={() => {
                        setRangoPrecio([precioMinimo, precioMaximo]);
                        setSoloMayores(false);
                        setTiposEspacioSeleccionados([]);
                    }}>
                        Limpiar filtros
                    </button>
                </div>
            </div>
            <div className="row g-4">
                {eventos
                    .filter(ev =>
                        Number(ev.precio) >= rangoPrecio[0] &&
                        Number(ev.precio) <= rangoPrecio[1] &&
                        (!soloMayores || ev.mayores_18) &&
                        (tiposEspacioSeleccionados.length === 0 || tiposEspacioSeleccionados.includes(ev.tipo_espacio))
                    )
                    .map(ev => (
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
                                    <p className="mb-1">
                                        <strong>🎟️ Entradas disponibles:</strong> {ev.aforo_total - ev.entradas_vendidas}
                                        {(ev.aforo_total - ev.entradas_vendidas < ev.aforo_total * 0.1) && (
                                            <span className="badge bg-danger ms-2">¡Últimas entradas!</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Modal de información */}
            <div className="modal fade" id="modalCompra" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {eventoSeleccionado && (
                            <div className="d-flex flex-row p-3">
                                {/* Imagen a la izquierda */}
                                <div className="me-3">
                                    {eventoSeleccionado.imagen ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${eventoSeleccionado.imagen.replace(/^.*[\\/]/, '')}`}
                                            alt={eventoSeleccionado.nombre_evento}
                                            style={{ width: "200px", height: "300px", objectFit: "cover", borderRadius: "8px" }}
                                        />
                                    ) : (
                                        <div
                                            style={{ width: "200px", height: "300px", backgroundColor: "#eee", borderRadius: "8px" }}
                                            className="d-flex justify-content-center align-items-center text-muted"
                                        >
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                                {/* Información a la derecha */}
                                <div className="flex-grow-1">
                                    <div className="modal-header border-0 pb-1">
                                        <h5 className="modal-title">{eventoSeleccionado.nombre_evento}</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>

                                    <div className="modal-body pt-0">
                                        <p><strong>📅 Fecha:</strong> {eventoSeleccionado.fecha}</p>
                                        <p><strong>📍 Lugar:</strong> {eventoSeleccionado.lugar}</p>
                                        <p><strong>🎤 Artista:</strong> {eventoSeleccionado.nombre_artista}</p>

                                        {(() => {
                                            const base = Number(eventoSeleccionado.precio);

                                            // fallback de seguridad en caso de que el usuario venga incompleto
                                            const isPremium = usuario?.is_premium || usuario?.role === "premium";
                                            const isDiscapacidad = Boolean(usuario?.discapacidad);

                                            let descuento = 0;
                                            let tipoDescuento = null;

                                            if (isDiscapacidad) {
                                                descuento = 0.50;
                                                tipoDescuento = "Descuento por discapacidad (50%)";
                                            } else if (isPremium) {
                                                descuento = 0.25;
                                                tipoDescuento = "Descuento por cuenta premium (25%)";
                                            }

                                            const final = base * (1 - descuento);

                                            return (
                                                <>
                                                    <p><strong>💶 Precio base:</strong> {base.toFixed(2)} €</p>
                                                    {descuento > 0 ? (
                                                        <>
                                                            <p className="text-success mb-1">✅ {tipoDescuento}</p>
                                                            <p><strong>💶 Precio con descuento:</strong> {final.toFixed(2)} €</p>
                                                        </>
                                                    ) : (
                                                        <p><strong>💶 Precio final:</strong> {final.toFixed(2)} €</p>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        <p>{eventoSeleccionado.informacion}</p>
                                        {eventoSeleccionado.mayores_18
                                            ? <p className="text-danger">🔞 Requiere ser mayor de 18 años</p>
                                            : <p className="text-success">✅ Apto para todos los públicos</p>}
                                        <p><strong>🧍‍♂️ Tipo de espacio:</strong> {eventoSeleccionado.tipo_espacio}</p>
                                    </div>

                                    <div className="modal-footer border-0 pt-0">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>


                                        {/* Condición para botones según tipo_espacio */}
                                        {eventoSeleccionado.tipo_espacio === "normal" && (
                                            <button className="btn btn-primary" onClick={() => iniciarPago(eventoSeleccionado)}>
                                                Comprar con Stripe
                                            </button>
                                        )}

                                        {eventoSeleccionado.tipo_espacio === "teatro" && (
                                            <button className="btn btn-warning" onClick={() => {
                                                // Redirige a la vista de selección de asientos
                                                window.location.href = `/seleccionar-asientos/${eventoSeleccionado.id}`;
                                            }}>
                                                Seleccionar asientos
                                            </button>
                                        )}

                                        {eventoSeleccionado.tipo_espacio === "estadio" && (
                                            <button className="btn btn-outline-secondary" disabled>
                                                Venta aún no disponible, vuelva en unos días
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
