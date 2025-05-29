import { OrbitControls, PerspectiveCamera, useTexture, useVideoTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

function Butaca({ position, ocupada, seleccionada, deshabilitada, onClick }) {
    const ref = useRef();
    useFrame(() => {
        if (seleccionada && ref.current) {
            ref.current.rotation.y += 0.02;
        }
    });
    return (
        <group position={position} onClick={!ocupada && !deshabilitada ? onClick : null} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0.5, -0.25]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.1]} />
                <meshStandardMaterial color={ocupada ? 'gray' : deshabilitada ? 'red' : seleccionada ? 'green' : 'blue'} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.6, 0.2, 0.6]} />
                <meshStandardMaterial color={ocupada ? 'gray' : deshabilitada ? 'red' : seleccionada ? 'green' : 'blue'} />
            </mesh>
        </group>
    );
}

function Escalera({ lado = 'derecha', filas = 25 }) {
    const posicionBaseX = lado === 'izquierda' ? -21.5 : 20.5;

    return (
        <group>
            {Array.from({ length: filas }).map((_, idx) => {
                const ancho = 2 + idx * 0.2;  // cada peldaño más ancho
                const y = idx * 0.2;
                const z = idx - filas / 2;
                const offsetX = (lado === 'izquierda' ? -1 : 1) * (ancho - 2) / 2;

                return (
                    <mesh
                        key={idx}
                        position={[posicionBaseX + offsetX, y, z]}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry args={[ancho, 0.5, 1]} />
                        <meshStandardMaterial color="#888" />
                    </mesh>
                );
            })}
        </group>
    );
}

function Escenario() {
    const texture = useTexture('/images/wood.png');

    return (
        <mesh position={[0, 0.2, -20]} receiveShadow>
            <boxGeometry args={[50, 1.5, 10]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

function ParedDetrasEscenario() {
    return (
        <mesh position={[0, 5, -26]} receiveShadow>
            <boxGeometry args={[60, 40, 1]} />
            <meshStandardMaterial color="#222" />
        </mesh>
    );
}



function PantallaCineVideo() {
    const texture = useVideoTexture('/videos/yoda.mp4');

    return (
        <mesh position={[0, 13, -25.4]}>
            <planeGeometry args={[50, 20]} />
            <meshStandardMaterial map={texture} toneMapped={false} />
        </mesh>
    );

}

function SueloEscalonadoBajoButacas({ filas = 25, columnas = 45 }) {
    const anchoTotal = columnas * 1.1; // cada columna = 1 unidad

    return (
        <group>
            {Array.from({ length: filas }).map((_, idx) => {
                const y = idx * 0.2; // altura escalonada como las butacas
                const z = idx - filas / 2;

                return (
                    <mesh
                        key={idx}
                        position={[0, y - 0, z]} // bajamos un poco para que no choque con las butacas
                        receiveShadow
                    >
                        <boxGeometry args={[anchoTotal, 0.2, 1]} />
                        <meshStandardMaterial color="#444" />
                    </mesh>
                );
            })}
        </group>
    );
}

function Actor() {
    const ref = useRef();
    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.01; // Gira lentamente
        }
    });

    return (
        <mesh ref={ref} position={[0, 1, -16]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

export default function Asientos3D() {
    const { id } = useParams();
    const { usuario } = useContext(UserContext);
    const navigate = useNavigate();

    const filas = 25;
    const columnas = 40;

    const [evento, setEvento] = useState(null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
    const [showVista, setShowVista] = useState(false);

    useEffect(() => {
        if (!usuario) return;

        fetch(`http://localhost:5000/eventos`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.eventos)) {
                    const ev = data.eventos.find(e => e.id === Number(id));
                    if (ev) setEvento(ev);
                }
            });

        fetch(`http://localhost:5000/asientos-ocupados/${id}`)
            .then(res => res.json())
            .then(data => setAsientosOcupados(data.asientos || []));
    }, [id, usuario]);

    const toggleSeleccion = (nombre) => {
        if (asientosSeleccionados.includes(nombre)) {
            setAsientosSeleccionados(prev => prev.filter(a => a !== nombre));
        } else {
            if (asientosSeleccionados.length >= 8) return;
            setAsientosSeleccionados(prev => [...prev, nombre]);
        }
    };

    const confirmar = () => {
        if (asientosSeleccionados.length === 0) return;
        navigate("/pago", {
            state: {
                evento,
                asientos: asientosSeleccionados
            }
        });
    };

    if (!usuario) {
        return (
            <div className="container py-5 text-center">
                <h3>🔒 Debes iniciar sesión para seleccionar asientos</h3>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {evento && (
                <>
                    <h2 className="mb-2 text-primary text-center">
                        🎭 Selección de asiento 3D – {evento.nombre_evento}
                    </h2>

                    <div className="alert alert-info text-center mb-3">
                        Usa el botón izquierdo para girar la cámara, la rueda para hacer zoom y el botón derecho para moverte.<br />
                        Puedes seleccionar hasta <strong>8 asientos</strong>. Los asientos grises están ocupados, los rojos reservados para discapacidad.<br />
                        <button className="btn btn-outline-dark btn-sm mt-2" onClick={() => setShowVista(true)}>
                            Ver cómo se ve desde aquí
                        </button>
                        <div className="mt-3">
                            <p className="mb-0">
                                <span className="badge bg-success d-inline-block me-2">&nbsp;</span>Seleccionado
                                <span className="badge bg-danger d-inline-block mx-2">&nbsp;</span>Reservado discapacidad
                                <span className="badge bg-secondary d-inline-block mx-2">&nbsp;</span>Ocupado
                                <span className="badge bg-primary d-inline-block mx-2">&nbsp;</span>Disponible
                            </p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '80vh' }}>
                        <Canvas shadows camera={{ position: [0, 40, 60], fov: 50 }}>
                            <ambientLight intensity={0.4} />
                            <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
                            <OrbitControls />
                            <Escenario />
                            <ParedDetrasEscenario />
                            <PantallaCineVideo />
                            <Actor />
                            <SueloEscalonadoBajoButacas filas={filas} columnas={columnas} />
                            <Escalera lado="izquierda" filas={filas} />
                            <Escalera lado="derecha" filas={filas} />
                            {Array.from({ length: filas }).map((_, filaIdx) =>
                                Array.from({ length: columnas }).map((_, colIdx) => {
                                    const nombre = `F${filaIdx + 1}-S${colIdx + 1}`;
                                    const ocupado = asientosOcupados.includes(nombre);
                                    const esPrimeraFila = filaIdx === 0;
                                    const esDiscapacidad = usuario?.discapacidad;
                                    const deshabilitado = ocupado || (esPrimeraFila && !esDiscapacidad);
                                    const seleccionado = asientosSeleccionados.includes(nombre);

                                    return (
                                        <Butaca
                                            key={nombre}
                                            position={[colIdx - columnas / 2, filaIdx * 0.2, filaIdx - filas / 2]}
                                            ocupada={ocupado}
                                            seleccionada={seleccionado}
                                            deshabilitada={deshabilitado}
                                            onClick={() => toggleSeleccion(nombre)}
                                        />
                                    );
                                })
                            )}
                        </Canvas>
                    </div>

                    <div className="text-center mt-4">
                        {asientosSeleccionados.length > 0 ? (
                            <>
                                <p><strong>Asientos seleccionados:</strong> {asientosSeleccionados.join(", ")}</p>
                                <button className="btn btn-success" onClick={confirmar}>
                                    Continuar con el pago
                                </button>
                            </>
                        ) : (
                            <p className="text-muted">Selecciona tus asientos (hasta 8)</p>
                        )}
                    </div>

                    <Modal show={showVista} onHide={() => setShowVista(false)} size="xl" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Vista desde tus asientos seleccionados</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ width: '100%', height: '70vh' }}>
                                <Canvas shadows>
                                    <ambientLight intensity={0.4} />
                                    <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

                                    {(() => {
                                        const match = asientosSeleccionados[0]?.match(/F(\d+)-S(\d+)/);
                                        if (!match) return null;
                                        const filaIdx = parseInt(match[1]) - 1;
                                        const colIdx = parseInt(match[2]) - 1;
                                        const camX = colIdx - columnas / 2;
                                        const camY = filaIdx * 0.2 + 1.5;
                                        const camZ = filaIdx - filas / 2 + 0.5;

                                        // Target un poco más adelante desde la butaca
                                        const targetZ = camZ - 5;

                                        return (
                                            <>
                                                <PerspectiveCamera makeDefault position={[camX, camY, camZ]} fov={60} />
                                                <OrbitControls
                                                    target={[camX, camY, targetZ]}
                                                    enablePan={false}
                                                    enableZoom={true}
                                                    enableRotate={true}
                                                    enableDamping={true}
                                                    dampingFactor={0.05}
                                                    maxDistance={10}
                                                    minDistance={2}
                                                />
                                            </>
                                        );
                                    })()}

                                    <Escenario />
                                    <ParedDetrasEscenario />
                                    <PantallaCineVideo />
                                    <Actor />
                                    <SueloEscalonadoBajoButacas filas={filas} columnas={columnas} />
                                    <Escalera position={[-21, 0.05, 0]} /> {/* Escalera izquierda */}
                                    <Escalera position={[21, 0.05, 0]} />  {/* Escalera derecha */}
                                    {Array.from({ length: filas }).map((_, filaIdx) =>
                                        Array.from({ length: columnas }).map((_, colIdx) => {
                                            const nombre = `F${filaIdx + 1}-S${colIdx + 1}`;
                                            return (
                                                <Butaca
                                                    key={nombre}
                                                    position={[colIdx - columnas / 2, filaIdx * 0.2, filaIdx - filas / 2]}
                                                    ocupada={false}
                                                    seleccionada={asientosSeleccionados.includes(nombre)}
                                                    deshabilitada={false}
                                                    onClick={() => { }}
                                                />
                                            );
                                        })
                                    )}
                                </Canvas>
                            </div>
                        </Modal.Body>
                    </Modal>
                </>
            )}
        </div>
    );
}
