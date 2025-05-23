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
    <div className="p-6 max-w-6xl mx-auto space-y-12">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">🎫 Gestión de Eventos</h1>
            <p className="text-gray-500 text-sm">Administra y supervisa todos los eventos de forma centralizada</p>
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-800">Crear Nuevo Evento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input className="w-full rounded-md border border-gray-300 px-4 py-2" onChange={e => setForm({ ...form, nombre_evento: e.target.value })} placeholder="Nombre del Evento" />
                <input type="date" className="w-full rounded-md border border-gray-300 px-4 py-2" onChange={e => setForm({ ...form, fecha: e.target.value })} />
                <input className="w-full rounded-md border border-gray-300 px-4 py-2" onChange={e => setForm({ ...form, lugar: e.target.value })} placeholder="Lugar" />
                <input className="w-full rounded-md border border-gray-300 px-4 py-2" onChange={e => setForm({ ...form, artista_nombre: e.target.value })} placeholder="Artista" />
                <textarea className="md:col-span-2 w-full rounded-md border border-gray-300 px-4 py-2" rows={3} onChange={e => setForm({ ...form, informacion: e.target.value })} />
                <input type="number" step="0.01" className="w-full rounded-md border border-gray-300 px-4 py-2" onChange={e => setForm({ ...form, precio: e.target.value })} />
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="mayores18" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" onChange={e => setForm({ ...form, mayores_18: e.target.checked })} />
                    <label htmlFor="mayores18" className="ml-2 text-sm text-gray-700">Solo mayores de 18 años</label>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Evento</label>
                    <div className="flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Seleccionar archivo
                            <input type="file" accept="image/*" className="sr-only" onChange={e => setImagen(e.target.files[0])} />
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{imagen ? imagen.name : 'Ningún archivo seleccionado'}</span>
                    </div>
                </div>
            </div>
            <div className="pt-4 text-center">
                <button onClick={crearEvento} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
                    <Plus className="w-5 h-5" /> Crear Evento
                </button>
            </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <CalendarCheck2 className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Eventos Programados</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-center">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Artista</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {eventos.map(ev => (
                            <tr key={ev.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{ev.nombre_evento}</div>
                                    <div className="text-sm text-gray-500">{ev.lugar}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(ev.fecha).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{ev.nombre_artista}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <button onClick={() => { setSelected(ev); setModalVisible(true); }} className="text-blue-600 hover:text-blue-800 mr-4">Editar</button>
                                    <button onClick={() => { setEventoAEliminar(ev.id); setConfirmVisible(true); }} className="text-red-600 hover:text-red-800">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <BarChart2 className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Estadísticas de Ventas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-indigo-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-indigo-800">HOY</h3>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas?.dia?.cantidad || 0}</p>
                    <p className="text-sm text-indigo-600">entradas vendidas</p>
                    <p className="text-lg font-medium text-indigo-700 mt-2">{estadisticas?.dia?.total || 0} €</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">ESTA SEMANA</h3>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas?.semana?.cantidad || 0}</p>
                    <p className="text-sm text-blue-600">entradas vendidas</p>
                    <p className="text-lg font-medium text-blue-700 mt-2">{estadisticas?.semana?.total || 0} €</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">ESTE MES</h3>
                    <p className="text-2xl font-semibold text-gray-900">{estadisticas?.mes?.cantidad || 0}</p>
                    <p className="text-sm text-purple-600">entradas vendidas</p>
                    <p className="text-lg font-medium text-purple-700 mt-2">{estadisticas?.mes?.total || 0} €</p>
                </div>
            </div>
        </section>

            {/* Modal de Edición */}
            {modalVisible && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Editar Evento</h3>
                                <button
                                    onClick={() => setModalVisible(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        value={selected.nombre_evento}
                                        onChange={e => setSelected({ ...selected, nombre_evento: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={selected.fecha}
                                        onChange={e => setSelected({ ...selected, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                                    <input
                                        value={selected.lugar}
                                        onChange={e => setSelected({ ...selected, lugar: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Artista</label>
                                    <input
                                        value={selected.nombre_artista}
                                        onChange={e => setSelected({ ...selected, nombre_artista: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        rows={3}
                                        value={selected.informacion}
                                        onChange={e => setSelected({ ...selected, informacion: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selected.precio}
                                        onChange={e => setSelected({ ...selected, precio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.mayores_18}
                                        onChange={e => setSelected({ ...selected, mayores_18: e.target.checked })}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Solo mayores de 18 años
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setModalVisible(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={actualizarEvento}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {confirmVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-700">¿Estás seguro que deseas eliminar este evento? Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmVisible(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    fetch(`http://localhost:5000/eventos/${eventoAEliminar}`, {
                                        method: "DELETE"
                                    }).then(() => {
                                        setConfirmVisible(false);
                                        window.location.reload();
                                    });
                                }}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};