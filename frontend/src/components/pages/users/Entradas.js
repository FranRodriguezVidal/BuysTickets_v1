import { useEffect, useState } from "react";

export default function Entradas() {
    const [entradas, setEntradas] = useState([]);
    const [favoritos, setFavoritos] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/entradas") // ajustar a tu ruta real
            .then(res => res.json())
            .then(data => setEntradas(data.entradas || []));

        fetch("http://localhost:5000/favoritos") // ajustar a tu ruta real
            .then(res => res.json())
            .then(data => setFavoritos(data.favoritos || []));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Mis Entradas</h1>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Compradas</h2>
                {entradas.map((e, i) => (
                    <div key={i} className="p-3 bg-white rounded shadow">
                        <strong>{e.nombre_evento}</strong> – {e.fecha}
                        <p>Asiento: {e.asiento}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold">Favoritos</h2>
                {favoritos.map((f, i) => (
                    <div key={i} className="p-3 bg-white rounded shadow">
                        <strong>{f.nombre_evento}</strong> – {f.fecha}
                        <p>Lugar: {f.lugar}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
