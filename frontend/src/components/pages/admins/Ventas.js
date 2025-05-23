import {
    BarChart2,
    CalendarCheck2,
    Plus
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Ventas() {
    const [estadisticas, setEstadisticas] = useState({});
    const [form, setForm] = useState({
        nombre_evento: "", fecha: "", lugar: "", artista_nombre: "",
        mayores_18: false, informacion: "", precio: ""
    });
    const [imagen, setImagen] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [selected, setSelected] = useState(null); // evento seleccionado para edición
    const [modalVisible, setModalVisible] = useState(false);
    const [eventoAEliminar, setEventoAEliminar] = useState(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    useEffect(() => {
        fetch("http://localhost:5000/estadisticas")
            .then(res => res.json())
            .then(setEstadisticas);

        fetch("http://localhost:5000/eventos")
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.eventos)) {
                    setEventos(data.eventos);
                } else {
                    setEventos([]);
                    console.error("Respuesta inesperada al obtener eventos:", data);
                }
            });
    }, []);

    function crearEvento() {
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (imagen) data.append("imagen", imagen);

        fetch("http://localhost:5000/eventos", {
            method: "POST",
            body: data,
        })
            .then(res => res.json())
            .then(data => alert(data.message));
    }

    function actualizarEvento() {
        const id = selected.id;
        fetch(`http://localhost:5000/eventos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selected)
        })
            .then(res => res.json())
            .then(() => {
                setModalVisible(false);
                window.location.reload();
            });
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-12" style={{ width: '90%' }}>
            <header className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">🎫 Gestión de Eventos</h1>
            </header>

            <section className="card border shadow-sm mb-5">
                <div className="card-header bg-light border-bottom d-flex align-items-center">
                    <div className="d-flex align-items-center">
                        <Plus className="me-2 text-primary" size={20} />
                        <h2 className="h5 mb-0 text-primary">Crear Nuevo Evento</h2>
                    </div>
                </div>

                <div className="card-body bg-light">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Nombre del Evento</label>
                            <input
                                type="text"
                                className="form-control border rounded"
                                placeholder="Nombre del evento"
                                onChange={e => setForm({ ...form, nombre_evento: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                className="form-control border rounded"
                                onChange={e => setForm({ ...form, fecha: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Lugar</label>
                            <input
                                type="text"
                                className="form-control border rounded"
                                placeholder="Lugar"
                                onChange={e => setForm({ ...form, lugar: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Artista</label>
                            <input
                                type="text"
                                className="form-control border rounded"
                                placeholder="Nombre del artista"
                                onChange={e => setForm({ ...form, artista_nombre: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Descripción</label>
                            <textarea
                                className="form-control border rounded"
                                rows={3}
                                placeholder="Detalles del evento"
                                onChange={e => setForm({ ...form, informacion: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Precio (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control border rounded"
                                placeholder="Precio"
                                onChange={e => setForm({ ...form, precio: e.target.value })}
                            />
                        </div>
                        <div style={{ backgroundColor: 'blue-ligth' }} className="col-md-6 d-flex align-items-center pt-4">
                            <input
                                type="checkbox"
                                className="form-check-input me-2"
                                id="mayores18"
                                onChange={e => setForm({ ...form, mayores_18: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="mayores18">
                                Solo mayores de 18 años
                            </label>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Imagen del Evento</label>
                            <div className="d-flex align-items-center">
                                <label className="btn btn-outline-secondary">
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="d-none"
                                        onChange={e => setImagen(e.target.files[0])}
                                    />
                                </label>
                                <span className="ms-3 small text-muted">
                                    {imagen ? imagen.name : 'Ningún archivo seleccionado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="text-center">
                        <button
                            onClick={crearEvento}
                            className="btn btn-primary px-5 py-2 shadow"
                        >
                            <Plus className="me-2" size={18} /> Crear Evento
                        </button>
                    </div>
                </div>
            </section>


            <section className="card border shadow-sm mb-5">
                <div className="card-header bg-light border-bottom d-flex align-items-center">
                    <CalendarCheck2 className="me-2 text-primary" size={20} />
                    <h2 className="h5 mb-0 text-primary">Eventos Programados</h2>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-bordered text-center mb-0">
                            <thead className="table-light text-uppercase small text-muted">
                                <tr>
                                    <th>Evento</th>
                                    <th>Fecha</th>
                                    <th>Artista</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventos.map(ev => (
                                    <tr key={ev.id}>
                                        <td>
                                            <div className="fw-semibold text-dark">{ev.nombre_evento}</div>
                                            <div className="text-muted small">{ev.lugar}</div>
                                        </td>
                                        <td className="text-muted">{new Date(ev.fecha).toLocaleDateString()}</td>
                                        <td className="text-muted">{ev.nombre_artista}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => { setSelected(ev); setModalVisible(true); }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => { setEventoAEliminar(ev.id); setConfirmVisible(true); }}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>


            <section className="card border shadow-sm mb-5">
                <div className="card-header bg-light border-bottom d-flex align-items-center">
                    <BarChart2 className="me-2 text-primary" size={20} />
                    <h2 className="h5 mb-0 text-primary">Estadísticas de Ventas</h2>
                </div>

                <div className="card-body">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="bg-primary-subtle border rounded p-3 h-100">
                                <h5 className="text-primary">HOY</h5>
                                <p className="display-6 fw-bold mb-0 text-dark">{estadisticas?.dia?.cantidad || 0}</p>
                                <p className="text-muted small mb-1">entradas vendidas</p>
                                <p className="h6 fw-semibold text-primary mt-2">{estadisticas?.dia?.total || 0} €</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="bg-info-subtle border rounded p-3 h-100">
                                <h5 className="text-info">ESTA SEMANA</h5>
                                <p className="display-6 fw-bold mb-0 text-dark">{estadisticas?.semana?.cantidad || 0}</p>
                                <p className="text-muted small mb-1">entradas vendidas</p>
                                <p className="h6 fw-semibold text-info mt-2">{estadisticas?.semana?.total || 0} €</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="bg-purple border rounded p-3 h-100" style={{ backgroundColor: '#f3e8ff' }}>
                                <h5 className="text-purple" style={{ color: '#6f42c1' }}>ESTE MES</h5>
                                <p className="display-6 fw-bold mb-0 text-dark">{estadisticas?.mes?.cantidad || 0}</p>
                                <p className="text-muted small mb-1">entradas vendidas</p>
                                <p className="h6 fw-semibold" style={{ color: '#6f42c1' }}>{estadisticas?.mes?.total || 0} €</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal de Edición */}
            {modalVisible && selected && (
                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border border-primary-subtle shadow-lg">
                            <div className="modal-header bg-primary-subtle">
                                <h5 className="modal-title text-primary">Editar Evento</h5>
                                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                            </div>
                            <div className="modal-body bg-light">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            value={selected.nombre_evento}
                                            onChange={e => setSelected({ ...selected, nombre_evento: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Fecha</label>
                                        <input
                                            type="date"
                                            value={selected.fecha}
                                            onChange={e => setSelected({ ...selected, fecha: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Lugar</label>
                                        <input
                                            value={selected.lugar}
                                            onChange={e => setSelected({ ...selected, lugar: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Artista</label>
                                        <input
                                            value={selected.nombre_artista}
                                            onChange={e => setSelected({ ...selected, nombre_artista: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            rows={3}
                                            value={selected.informacion}
                                            onChange={e => setSelected({ ...selected, informacion: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Precio (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={selected.precio}
                                            onChange={e => setSelected({ ...selected, precio: e.target.value })}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center pt-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.mayores_18}
                                            onChange={e => setSelected({ ...selected, mayores_18: e.target.checked })}
                                            className="form-check-input me-2"
                                        />
                                        <label className="form-check-label">Solo mayores de 18 años</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button onClick={() => setModalVisible(false)} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button onClick={actualizarEvento} className="btn btn-primary">
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {confirmVisible && (
                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border border-danger-subtle shadow-lg">
                            <div className="modal-header bg-danger-subtle">
                                <h5 className="modal-title text-danger">Confirmar Eliminación</h5>
                                <button type="button" className="btn-close" onClick={() => setConfirmVisible(false)}></button>
                            </div>
                            <div className="modal-body bg-light">
                                <p>¿Estás seguro que deseas eliminar este evento? Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={() => setConfirmVisible(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        fetch(`http://localhost:5000/eventos/${eventoAEliminar}`, {
                                            method: "DELETE"
                                        }).then(() => {
                                            setConfirmVisible(false);
                                            window.location.reload();
                                        });
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};