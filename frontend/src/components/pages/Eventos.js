import { useEffect, useState } from "react";

export default function Eventos() {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/eventos")
            .then(res => res.json())
            .then(data => {
                if (data.success) setEventos(data.eventos);
            });
    }, []);

    function comprar(id) {
        alert(`Comprar entradas para el evento ID: ${id}`);
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-10 text-indigo-800">🎫 Eventos Disponibles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {eventos.map(ev => (
                    <div key={ev.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                        {ev.imagen && (
                            <img
                                src={`http://localhost:5000/eventos/uploads/${ev.imagen.replace(/^.*[\\/]/, '')}`}
                                alt={ev.nombre_evento}
                                className="w-full h-48 object-cover"
                            />
                        )}

                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{ev.nombre_evento}</h2>
                                <p className="text-gray-600">📍 {ev.lugar}</p>
                                <p className="text-gray-600">📅 {ev.fecha}</p>
                                <p className="text-gray-800 mt-2">{ev.informacion}</p>
                                <p className="mt-2 text-green-700 font-semibold">💶 {Number(ev.precio).toFixed(2)} €</p>
                                {ev.mayores_18 && (
                                    <p className="mt-1 text-red-600 font-bold">🔞 Solo mayores de 18 años</p>
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition" onClick={() => comprar(ev.id)}>
                                    Comprar
                                </button>
                                {ev.lugar.toLowerCase().includes("teatro") && (
                                    <button className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition">
                                        Ver Asientos
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}