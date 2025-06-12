import { Html, OrbitControls, PerspectiveCamera, useTexture, useVideoTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const API_BASE_URL = "https://buystickets-v1.onrender.com";

function Butaca({ position, ocupada, seleccionada, deshabilitada, onClick }) {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);
    

    useFrame(() => {
        if (seleccionada && ref.current) {
            ref.current.rotation.y += 0.02;
        }
    });

    return (
        <group
            position={position}
            onClick={!ocupada && !deshabilitada ? onClick : null}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            rotation={[0, Math.PI, 0]}
        >
            <mesh ref={ref} position={[0, 0.5, -0.25]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.1]} />
                <meshStandardMaterial color={ocupada ? 'gray' : deshabilitada ? 'red' : seleccionada ? 'green' : 'blue'} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.6, 0.2, 0.6]} />
                <meshStandardMaterial color={ocupada ? 'gray' : deshabilitada ? 'red' : seleccionada ? 'green' : 'blue'} />
            </mesh>
            {hovered && deshabilitada && (
                <Html center distanceFactor={8}>
                    <div style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                    }}>
                        {ocupada
                            ? "⛔ Asiento ocupado"
                            : "♿ Reservado para personas con discapacidad"}
                    </div>
                </Html>
            )}
        </group>
    );
}


function Escalera({ lado = 'derecha', filas = 25 }) {
    const posicionBaseX = lado === 'izquierda' ? -21.5 : 20.5;

    return (
        <group>
            {Array.from({ length: filas }).map((_, idx) => {
                const ancho = 2 + idx * 0.2;
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
        <mesh position={[0, 0.2, -30]} receiveShadow>
            <boxGeometry args={[50, 1.5, 30]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

function ParedDetrasEscenario() {
    return (
        <mesh position={[0, 5, -36]} receiveShadow>
            <boxGeometry args={[60, 40, 1]} />
            <meshStandardMaterial color="#222" />
        </mesh>
    );
}

function Cortina({ lado = 'izquierda' }) {
    const x = lado === 'izquierda' ? -24 : 24;
    return (
        <mesh position={[x, 10, -30]}>
            <boxGeometry args={[10, 40, 1]} />
            <meshStandardMaterial color="#8B0000" />
        </mesh>
    );
}

function CortinaCentral() {
    return (
        <mesh position={[0, 27, -30]}>
            <boxGeometry args={[40, 6, 1]} />
            <meshStandardMaterial color="#8B0000" />
        </mesh>
    );
}

function ParedFinalButacas({ altura = 40, ancho = 60 }) {
    return (
        <mesh position={[0, altura / 2, 25]} receiveShadow>
            <boxGeometry args={[ancho, altura, 1]} />
            <meshStandardMaterial color="#333" />
        </mesh>
    );
}

function Tejado({ ancho = 60, largo = 100 }) {
    return (
        <mesh position={[0, 25, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ancho, largo]} />
            <meshStandardMaterial color="#222" side={2} />
        </mesh>
    );
}

function ParedLateral({ lado = 'izquierda', altura = 40, largo = 100 }) {
    const x = lado === 'izquierda' ? -26 : 26;
    return (
        <mesh position={[x, altura / 2, 0]} receiveShadow>
            <boxGeometry args={[1, altura, largo]} />
            <meshStandardMaterial color="#333" />
        </mesh>
    );
}

function SueloGeneral() {
    return (
        <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[80, 100]} />
            <meshStandardMaterial color="#222" />
        </mesh>
    );
}

function PantallaCineVideo() {
    const texture = useVideoTexture('/videos/yoda.mp4');

    return (
        <mesh position={[0, 13, -35.4]}>
            <planeGeometry args={[50, 20]} />
            <meshStandardMaterial map={texture} toneMapped={false} />
        </mesh>
    );
}

function SueloEscalonadoBajoButacas({ filas = 25, columnas = 45 }) {
    const anchoTotal = columnas * 1.1;

    return (
        <group>
            {Array.from({ length: filas }).map((_, idx) => {
                const y = idx * 0.2;
                const z = idx - filas / 2;

                return (
                    <mesh
                        key={idx}
                        position={[0, y - 0, z]}
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
            ref.current.rotation.y += 0.01;
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
    const [vistaButaca, setVistaButaca] = useState(null);
    const [scrollBloqueado, setScrollBloqueado] = useState(false);
    const [codigoDescuento, setCodigoDescuento] = useState("");
    const [codigoValido, setCodigoValido] = useState(false);
    const [mensajeCodigo, setMensajeCodigo] = useState("");

    // Función para validar el código al pulsar el botón
    const aplicarCodigo = () => {
        if (codigoDescuento.trim() === "BuysTickets_Discapacidad_2025") {
            setCodigoValido(true);
            setMensajeCodigo("✅ Código válido, primera fila desbloqueada");
        } else {
            setCodigoValido(false);
            setMensajeCodigo("❌ Código inválido");
        }
    };

    const precioUnitario = evento?.precio || 0;
    const cantidad = asientosSeleccionados.length;

    const esDiscapacidad = usuario?.discapacidad === "sí";
    const esPremium = usuario?.is_premium === true;

    let descuento = 0;
    let origenDescuento = "";

    if (codigoValido) {
        descuento = 0.5;
        origenDescuento = "🔐 Código válido de discapacidad (50%)";
    } else if (esDiscapacidad) {
        descuento = 0.5;
        origenDescuento = "Descuento automático por discapacidad (50%)";
    } else if (esPremium) {
        descuento = 0.25;
        origenDescuento = "Descuento premium (25%)";
    }

    const totalSinDescuento = precioUnitario * cantidad;
    const totalConDescuento = totalSinDescuento * (1 - descuento);

    useEffect(() => {
        if (!usuario) return;

        fetch(`${API_BASE_URL}/eventos`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.eventos)) {
                    const ev = data.eventos.find(e => e.id === Number(id));
                    if (ev) setEvento(ev);
                }
            });

        fetch(`${API_BASE_URL}/asientos-ocupados/${id}`)
            .then(res => res.json())
            .then(data => {
                setAsientosOcupados(data.asientos || []);
            });
    }, [id, usuario]);

    useEffect(() => {
        document.body.style.overflow = scrollBloqueado ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [scrollBloqueado]);

    const toggleSeleccion = (nombre) => {
        if (asientosSeleccionados.includes(nombre)) {
            setAsientosSeleccionados(prev => prev.filter(a => a !== nombre));
        } else {
            if (asientosSeleccionados.length >= 8) return;
            setAsientosSeleccionados(prev => [...prev, nombre]);
        }
    };

    const checkoutHandler = async () => {
        if (!usuario || !evento || asientosSeleccionados.length === 0) {
            alert("⚠️ Faltan datos");
            return;
        }

        const payload = {
            user_id: usuario.user_id || usuario.id || 1,
            event_id: evento.id,
            tickets: asientosSeleccionados.map(nombre => ({
                asiento: nombre,
                nombre_comprador: `${usuario.nombre} ${usuario.apellido}`,
                email_comprador: usuario.email
            }))
        };

        const response = await fetch(`${API_BASE_URL}/comprar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success) {
            navigate(`/entrada-generada?email=${data.email}&evento=${encodeURIComponent(data.evento)}`);
        } else {
            alert("❌ Error al registrar las entradas: " + data.message);
        }
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
                        <div className="mt-3">
                            <p className="mb-0">
                                <span className="badge bg-success d-inline-block me-2">&nbsp;</span>Seleccionado
                                <span className="badge bg-danger d-inline-block mx-2">&nbsp;</span>Reservado discapacidad
                                <span className="badge bg-secondary d-inline-block mx-2">&nbsp;</span>Ocupado
                                <span className="badge bg-primary d-inline-block mx-2">&nbsp;</span>Disponible
                            </p>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
                        <Canvas shadows>
                            <ambientLight intensity={0.4} />
                            <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
                            <OrbitControls
                                makeDefault
                                enableRotate={true}
                                enableZoom={true}
                                enablePan={true}
                                enableDamping={true}
                                dampingFactor={0.1}
                                minPolarAngle={Math.PI / 6}
                                maxPolarAngle={Math.PI / 2.1}
                                target={[0, 8, 0]}
                                onChange={(e) => {
                                    const cam = e.target.object;
                                    cam.position.x = Math.max(-25, Math.min(25, cam.position.x));
                                    cam.position.y = Math.max(5, Math.min(25, cam.position.y));
                                    cam.position.z = Math.max(-50, Math.min(50, cam.position.z));
                                }}
                            />

                            <Escenario />
                            <CortinaCentral />
                            <ParedFinalButacas />
                            <SueloGeneral />
                            <ParedLateral lado="izquierda" />
                            <ParedLateral lado="derecha" />
                            <ParedDetrasEscenario />
                            <PantallaCineVideo />
                            <Cortina lado="izquierda" />
                            <Cortina lado="derecha" />
                            <Actor />
                            <SueloEscalonadoBajoButacas filas={filas} columnas={columnas} />
                            <Escalera lado="izquierda" filas={filas} />
                            <Escalera lado="derecha" filas={filas} />

                            {Array.from({ length: filas }).map((_, filaIdx) =>
                                Array.from({ length: columnas }).map((_, colIdx) => {
                                    const nombre = `Fila ${filaIdx + 1} Butaca ${colIdx + 1}`;
                                    const ocupado = asientosOcupados.includes(nombre);
                                    const esPrimeraFila = filaIdx === 0;
                                    const puedeUsarPrimeraFila = esDiscapacidad || codigoValido;
                                    const deshabilitado = ocupado || (esPrimeraFila && !puedeUsarPrimeraFila);
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

                        <button
                            onClick={() => setScrollBloqueado(prev => !prev)}
                            style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '15px',
                                zIndex: 10,
                                backgroundColor: scrollBloqueado ? '#dc3545' : '#0d6efd',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '10px 20px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                cursor: 'pointer'
                            }}
                        >
                            {scrollBloqueado ? '🔓 Desbloquear scroll' : '🔒 Bloquear scroll'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <>
                            {asientosSeleccionados.length > 0 && (
                                <>
                                    <p><strong>Asientos seleccionados:</strong> {asientosSeleccionados.join(", ")}</p>
                                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                                        {asientosSeleccionados.map((nombre, index) => (
                                            <button
                                                key={index}
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    setVistaButaca(nombre);
                                                    setShowVista(true);
                                                }}
                                            >
                                                👁 Ver vista desde {nombre}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            <p>
                                <strong>Total:</strong>{" "}
                                {totalConDescuento.toFixed(2)} €
                            </p>

                            {descuento > 0 && (
                                <p className="text-success">
                                    ✅ {origenDescuento}
                                </p>
                            )}

                            <div className="mt-3" style={{ maxWidth: "300px", margin: "0 auto" }}>
                                <label htmlFor="codigoDescuento" className="form-label">
                                    🔐 Código de descuento
                                </label>
                                <input
                                    type="text"
                                    id="codigoDescuento"
                                    className="form-control text-center"
                                    placeholder="Introduce tu código"
                                    value={codigoDescuento}
                                    onChange={(e) => {
                                        setCodigoDescuento(e.target.value);
                                        setMensajeCodigo("");
                                        setCodigoValido(false);
                                    }}
                                    disabled={codigoValido}
                                />
                                <button
                                    className="btn btn-primary mt-2 w-100"
                                    onClick={aplicarCodigo}
                                    disabled={codigoValido}
                                >
                                    Aplicar código
                                </button>
                                {mensajeCodigo && (
                                    <p className={codigoValido ? "text-success mt-2" : "text-danger mt-2"}>
                                        {mensajeCodigo}
                                    </p>
                                )}
                            </div>

                            <button
                                className="btn btn-success mt-3"
                                onClick={checkoutHandler}
                                disabled={cantidad === 0}
                            >
                                Proceder al pago seguro
                            </button>
                        </>
                    </div>

                    <Modal show={showVista} onHide={() => setShowVista(false)} size="xl" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Vista desde tus asientos seleccionados</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ width: '100%', height: '70vh' }}>
                                <Canvas shadows camera={{ position: [0, 10, -40], fov: 50 }}>
                                    <ambientLight intensity={0.4} />
                                    <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

                                    {(() => {
                                        const match = vistaButaca?.match(/Fila (\d+) Butaca (\d+)/);
                                        if (!match) return null;
                                        const filaIdx = parseInt(match[1]) - 1;
                                        const colIdx = parseInt(match[2]) - 1;
                                        const camX = colIdx - columnas / 2;
                                        const camY = filaIdx * 0.2 + 1.5;
                                        const camZ = filaIdx - filas / 2 + 0.5;

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
                                    <CortinaCentral />
                                    <Tejado />
                                    <ParedFinalButacas />
                                    <SueloGeneral />
                                    <ParedLateral lado="izquierda" />
                                    <ParedLateral lado="derecha" />
                                    <ParedDetrasEscenario />
                                    <PantallaCineVideo />
                                    <Cortina lado="izquierda" />
                                    <Cortina lado="derecha" />
                                    <Actor />
                                    <SueloEscalonadoBajoButacas filas={filas} columnas={columnas} />
                                    <Escalera position={[-21, 0.05, 0]} />
                                    <Escalera position={[21, 0.05, 0]} />
                                    {Array.from({ length: filas }).map((_, filaIdx) =>
                                        Array.from({ length: columnas }).map((_, colIdx) => {
                                            const nombre = `Fila ${filaIdx + 1} Butaca ${colIdx + 1}`;
                                            const ocupado = asientosOcupados.includes(nombre);
                                            const esPrimeraFila = filaIdx === 0;
                                            const puedeUsarPrimeraFila = esDiscapacidad || codigoValido;
                                            const deshabilitado = ocupado || (esPrimeraFila && !puedeUsarPrimeraFila);
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
                        </Modal.Body>
                    </Modal>
                </>
            )}
        </div>
    );
}
