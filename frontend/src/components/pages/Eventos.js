import { loadStripe } from '@stripe/stripe-js';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "rc-slider/assets/index.css";
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
    const [precioMaximo, setPrecioMaximo] = useState(1000);
    const [precioSeleccionado, setPrecioSeleccionado] = useState(1000); // valor actual elegido
    const idAperturaDirecta = queryParams.get("abrir");
    const [cantidadEntradas, setCantidadEntradas] = useState(1);


    useEffect(() => {
        fetch("http://localhost:5000/eventos")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEventos(data.eventos);

                    // Recalcular precios
                    const precios = data.eventos.map(ev => Number(ev.precio));
                    const min = Math.min(...precios);
                    const max = Math.max(...precios);
                    setPrecioMinimo(min);
                    setPrecioMaximo(max);
                    setPrecioSeleccionado(max);

                    // Abrir modal si hay ?abrir=ID
                    if (idAperturaDirecta) {
                        setTimeout(() => {
                            const seleccionado = data.eventos.find(ev => String(ev.id) === idAperturaDirecta);
                            if (seleccionado) {
                                setEventoSeleccionado(seleccionado);
                                const modalEl = document.getElementById("modalCompra");
                                if (modalEl) {
                                    const modal = new window.bootstrap.Modal(modalEl, {
                                        backdrop: true,
                                        keyboard: true
                                    });
                                    modal.show();
                                }
                            }
                        }, 400);
                    }
                }
            });
    }, [location.search]); // ⚠️ importante

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
                precio: precioFinal * cantidadEntradas,
                evento: evento.nombre_evento,
                event_id: evento.id,
                user_id: usuario.id,
                asiento: "A12", // puedes adaptar si es necesario
                nombre_comprador: usuario.nombre,
                email_comprador: usuario.email,
                cantidad: cantidadEntradas // este campo sí es enviado
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

    useEffect(() => {
        const modalEl = document.getElementById("modalCompra");

        if (!modalEl) return;

        const handleHidden = () => {
            // 🔃 Recargar la página al cerrar el modal
            window.location.href = location.pathname;
        };

        modalEl.addEventListener("hidden.bs.modal", handleHidden);

        return () => {
            modalEl.removeEventListener("hidden.bs.modal", handleHidden);
        };
    }, [location.search]);

    useEffect(() => {
        if (!eventos.length || !idAperturaDirecta) return;

        const seleccionado = eventos.find(ev => String(ev.id) === idAperturaDirecta);
        if (seleccionado) {
            setEventoSeleccionado(seleccionado);
            setTimeout(() => {
                const modalEl = document.getElementById("modalCompra");
                if (modalEl) {
                    const modal = new window.bootstrap.Modal(modalEl, {
                        backdrop: true,
                        keyboard: true
                    });
                    modal.show();
                }
            }, 300); // Asegura que el modal esté montado en el DOM
        }
    }, [eventos, idAperturaDirecta]);

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5 text-primary">🎫 Eventos Disponibles</h1>
            <div className="mb-4">
                <h5 className="mb-3">🔎 Filtrar eventos:</h5>

                <Form.Label>💶 Precio máximo permitido: {precioSeleccionado} €</Form.Label>
                <Form.Range
                    min={precioMinimo}
                    max={precioMaximo}
                    value={precioSeleccionado}
                    onChange={(e) => setPrecioSeleccionado(Number(e.target.value))}
                />

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
                    <button className="btn btn-outline-danger mt-3" onClick={() => {
                        setPrecioSeleccionado(precioMaximo);
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
                        Number(ev.precio) <= precioSeleccionado &&
                        (!soloMayores || ev.mayores_18) &&
                        (tiposEspacioSeleccionados.length === 0 || tiposEspacioSeleccionados.includes(ev.tipo_espacio))
                    )
                    .map(ev => {
                        const hoy = new Date();
                        const fechaEvento = new Date(ev.fecha);
                        const esPasado = fechaEvento < hoy;

                        return (
                            <div key={ev.id} className="col-12">
                                <div
                                    className={`card shadow-sm d-flex flex-row align-items-start p-3 ${esPasado ? "bg-light text-muted" : ""}`}
                                    style={{
                                        cursor: esPasado ? "default" : "pointer",
                                        opacity: esPasado ? 0.6 : 1
                                    }}
                                    onClick={() => !esPasado && verMas(ev.id)}
                                >
                                    {/* Imagen */}
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

                                    {/* Info */}
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
                                        {esPasado && (
                                            <p className="text-muted mt-2">
                                                ✅ Evento ya realizado
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                            const isDiscapacidad = usuario?.discapacidad === "sí";

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
                                    {/* Mostrar cantidad SOLO si es de tipo 'normal' */}
                                    {eventoSeleccionado.tipo_espacio === "normal" && (
                                        <div className="mb-3">
                                            <label htmlFor="cantidad" className="form-label">🎟️ ¿Cuántas entradas deseas comprar?</label>
                                            <input
                                                type="number"
                                                id="cantidad"
                                                className="form-control"
                                                min={1}
                                                max={8}
                                                value={cantidadEntradas}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val >= 1 && val <= 8) {
                                                        setCantidadEntradas(val);
                                                    }
                                                }}
                                            />
                                            <small className="text-muted">Puedes comprar hasta 8 entradas por usuario</small>
                                        </div>
                                    )}

                                    <div className="modal-footer border-0 pt-0">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>


                                        {/* Condición para botones según tipo_espacio */}
                                        {eventoSeleccionado.tipo_espacio === "normal" && (
                                            usuario ? (

                                                <button className="btn btn-primary" onClick={() => iniciarPago(eventoSeleccionado)}>
                                                    Comprar con Stripe
                                                </button>
                                            ) : (
                                                <button className="btn btn-secondary" disabled>
                                                    Inicia sesión para comprar
                                                </button>
                                            )
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
