import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Alert, Button, Container, Dropdown, Form, InputGroup, Modal, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaCog, FaGlobe, FaMicrophone, FaSearch, FaSignOutAlt, FaTicketAlt, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import i18n from "../traduccion/i18n";
import "./NavBar.css";


const NavBar = () => {
    const { showLogin, setShowLogin } = useContext(UserContext);
    const [showRegister, setShowRegister] = useState(false);
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    //const [role, setRole] = useState("estandar");
    const [profile, setProfile] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [language, setLanguage] = useState(localStorage.getItem("language") || "es"); // Idioma predeterminado
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState(""); // Agregado para la búsqueda
    const { usuario, setUsuario, logout } = useContext(UserContext); // NUEVO
    const navigate = useNavigate(); // NUEVO
    const [showRecovery, setShowRecovery] = useState(false);
    const [userRecovery, setUserRecovery] = useState("");
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState("");
    const [verificado, setVerificado] = useState(false);
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [recoveryError, setRecoveryError] = useState("");
    const [recoverySuccess, setRecoverySuccess] = useState("");
    const [sugerencias, setSugerencias] = useState([]);
    const id = usuario?.id;

    const API_BASE_URL = "https://buystickets-v1.onrender.com";

    // Verificación adicional para manejar el caso en que el usuario se elimina
    useEffect(() => {
        const verificarUsuario = async () => {
            const usuarioGuardado = localStorage.getItem("usuario");
            if (!usuarioGuardado) return;

            const parsedUser = JSON.parse(usuarioGuardado);

            try {
                const response = await axios.post(`${API_BASE_URL}/verify-user`, {
                    user: parsedUser.user,
                });

                if (!response.data.exists) {
                    logout();
                    alert("Tu sesión ha expirado o el usuario fue eliminado.");
                    navigate("/inicio");
                }
            } catch (err) {
                console.error("Error al verificar el usuario:", err);
            }
        };

        verificarUsuario();
    }, [logout, navigate]);


    const handleLogout = () => {
        logout();
        alert("Has cerrado sesión correctamente.");
        navigate("/inicio");
    };



    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const handleSearch = () => {
        if (sugerencias.length > 0) {
            const evento = sugerencias[0];
            navigate(`/eventos?search=${encodeURIComponent(evento.nombre_evento)}&abrir=${evento.id}`);
        } else if (searchQuery.trim()) {
            navigate(`/eventos?search=${encodeURIComponent(searchQuery.trim())}`);
        }

        setSearchQuery("");
        setSugerencias([]);

        // opcional: quitar foco
        document.activeElement?.blur();
    };


    useEffect(() => {
        const fetchSugerencias = async () => {
            if (searchQuery.length < 2) {
                setSugerencias([]);
                return;
            }

            try {
                const res = await axios.get(`${API_BASE_URL}/eventos`);
                if (res.data.success) {
                    const coincidencias = res.data.eventos.filter(ev =>
                        ev.nombre_evento.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ev.nombre_artista.toLowerCase().includes(searchQuery.toLowerCase())
                    ).slice(0, 5); // limitar sugerencias
                    setSugerencias(coincidencias);
                }
            } catch (error) {
                console.error("Error buscando sugerencias:", error);
                setSugerencias([]);
            }
        };

        fetchSugerencias();
    }, [searchQuery]);

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Tu navegador no soporta el reconocimiento de voz.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = language; // Usa el idioma seleccionado
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => console.log("Escuchando...");
        recognition.onend = () => console.log("Detenido");

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };

        recognition.start();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { user, password });

            if (response.data.success) {
                const usuarioData = {
                    id,
                    user,
                    nombre: response.data.nombre,
                    apellido: response.data.apellido,
                    email: response.data.email,
                    role: response.data.role,
                    profile: response.data.profile || null,
                };

                setUsuario(usuarioData);  // desde contexto
                setShowLogin(false);
                setUser("");
                setPassword("");
                alert("Has iniciado sesión correctamente.");
                navigate("/inicio"); // Opcional
            }
            else {
                setError("Usuario o contraseña incorrectos.");
            }
        } catch (err) {
  console.error("Error en la petición:", err);
  setError(err.response?.data?.message || err.message || "Error al conectar con el servidor.");
}

    };


    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const formData = new FormData();
        formData.append("user", user);
        formData.append("password", password);
        formData.append("nombre", nombre);
        formData.append("apellido", apellido);
        formData.append("email", email);
        formData.append("profile", profile); // Imagen de perfil

        try {
            const response = await axios.post(`${API_BASE_URL}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success) {
                setSuccessMessage("Registro exitoso. Ahora puedes iniciar sesión.");
                setShowRegister(false);
                setShowLogin(true);
                setUser("");
                setNombre("");
                setApellido("");
                setEmail("");
                setPassword("");
                setProfile(null);
                alert("Registrado correctamente.");
            } else {
                setError(response.data.message || "Error al registrar usuario.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        }
    };


    // Lógica para enviar código
    const handleEnviarCodigo = async () => {
        setRecoveryError("");
        try {
            const res = await axios.post(`${API_BASE_URL}/send-recovery-code`, { user: userRecovery });
            if (res.data.success) {
                setCodigoEnviado(true);
            } else {
                setRecoveryError(t(res.data.message));
            }
        } catch {
            setRecoveryError(t("Error al enviar el código. Intenta más tarde."));
        }
    };

    // Lógica para verificar código
    const handleVerificarCodigo = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/verify-recovery-code`, {
                user: userRecovery,
                code: codigoIngresado
            });
            if (res.data.success) {
                setVerificado(true);
            } else {
                setRecoveryError(t("Código incorrecto."));
            }
        } catch {
            setRecoveryError(t("Error al verificar el código."));
        }
    };

    // Lógica para cambiar la contraseña
    const handleCambiarPassword = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/change-password`, {
                user: userRecovery,
                new_password: nuevaPassword
            });
            if (res.data.success) {
                setRecoverySuccess(t("Contraseña cambiada exitosamente."));
                setTimeout(() => {
                    setShowRecovery(false);
                    setShowLogin(true);
                    // Reinicia todos los estados
                    setUserRecovery("");
                    setCodigoEnviado(false);
                    setCodigoIngresado("");
                    setVerificado(false);
                    setNuevaPassword("");
                    setRecoverySuccess("");
                }, 3000);
            } else {
                setRecoveryError(t(res.data.message));
            }
        } catch {
            setRecoveryError(t("Error al cambiar la contraseña."));
        }
    };

    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg" className="sticky-top">
                <Container>
                    <Navbar.Brand href="/inicio">
                        <img src="/images/logo.png" alt="Logo" className="custom-logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto"> {/* Centra los enlaces */}
                            <Nav.Link className="" href="/inicio">{t("Inicio")}</Nav.Link>
                            <Nav.Link className="me-5" href="/eventos">{t("Eventos")}</Nav.Link>
                            <div className="position-relative ms-5" style={{ width: '90%' }}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder={t("Buscar...")}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <Button variant="light" onClick={handleSearch}>
                                        <FaSearch />
                                    </Button>
                                    <Button variant="light" onClick={handleVoiceSearch}>
                                        <FaMicrophone />
                                    </Button>
                                </InputGroup>

                                {sugerencias.length > 0 && (
                                    <div className="position-absolute bg-white border rounded w-100 shadow mt-1 z-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        {sugerencias.map((evento, index) => (
                                            <div
                                                key={index}
                                                className="d-flex align-items-center gap-3 px-3 py-2 hover-bg"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSugerencias([]);
                                                    navigate(`/eventos?search=${encodeURIComponent(evento.nombre_evento)}&abrir=${evento.id}`);
                                                }}
                                            >
                                                {evento.imagen ? (
                                                    <img
                                                        src={`${API_BASE_URL}/uploads/${evento.imagen.replace(/^.*[\\/]/, '')}`}
                                                        alt={evento.nombre_evento}
                                                        style={{ width: "50px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: "50px",
                                                        height: "60px",
                                                        backgroundColor: "#eee",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        color: "#888"
                                                    }}>Sin<br />imagen</div>
                                                )}

                                                <div className="flex-grow-1">
                                                    <strong>{evento.nombre_evento}</strong><br />
                                                    <small className="text-muted">🎤 {evento.nombre_artista}</small><br />
                                                    <small className="text-success">💶 {Number(evento.precio).toFixed(2)} €</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </Nav>
                        {usuario ? (
                            <Nav className="me-5"> {/* Alinea a la derecha */}
                                <NavDropdown
                                    title={
                                        <>
                                            {usuario.profile ? (
                                                <img
                                                    src={usuario.profile}
                                                    alt="Perfil"
                                                    className="profile-image me-2 rounded-circle"
                                                    style={{ width: "52px", height: "52px", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <FaUser className="me-1" />
                                            )}

                                            {t("¡Hola")}, {usuario.nombre} {usuario.apellido}!
                                        </>
                                    }
                                    id="user-dropdown"
                                >
                                    {/* Mostrar las opciones para usuarios Premium */}
                                    {usuario?.role === "premium" && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/entradas">
                                                <FaTicketAlt className="me-2" /> {t("Mis Entradas")}
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/configuracion">
                                                <FaCog className="me-2" /> {t("Configuración")}
                                            </NavDropdown.Item>
                                        </>
                                    )}

                                    {/* Mostrar las opciones para usuarios Estándar */}
                                    {usuario?.role === "estandar" && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/entradas">
                                                <FaTicketAlt className="me-2" /> {t("Mis Entradas")}
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/configuracion">
                                                <FaCog className="me-2" /> {t("Configuración")}
                                            </NavDropdown.Item>
                                        </>
                                    )}

                                    {usuario?.role === "admin" && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/admin">
                                                <FaCog className="me-2" /> {t("Administrar")}
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/usuarios">
                                                <FaUser className="me-2" />  {t("Usuarios")}
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/ventas">
                                                <FaTicketAlt className="me-2" /> {t("Eventos")}
                                            </NavDropdown.Item>
                                        </>
                                    )}

                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <FaSignOutAlt className="me-2" /> {t("Cerrar Sesión")}
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        ) : (
                            <Nav className="ms-auto me-5"> {/* Alinea a la derecha */}
                                <Nav.Link onClick={() => setShowLogin(true)}>
                                    <FaUser className="me-1" /> {t("Iniciar Sesión")}
                                </Nav.Link>
                            </Nav>
                        )}

                        <Dropdown className="me-3">
                            <Dropdown.Toggle variant="light" id="dropdown-basic">
                                <FaGlobe className="me-1" /> {t("Idioma")}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleLanguageChange("es")}>
                                    <img src="https://flagcdn.com/w40/es.png" alt="Español" className="me-2" width="25" /> Español
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleLanguageChange("en")}>
                                    <img src="https://flagcdn.com/w40/gb.png" alt="English" className="me-2" width="25" /> English
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleLanguageChange("pl")}>
                                    <img src="https://flagcdn.com/w40/pl.png" alt="Polski" className="me-2" width="25" /> Polski
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleLanguageChange("ar")}>
                                    <img src="https://flagcdn.com/w40/ae.png" alt="العربية" className="me-2" width="25" /> العربية
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Navbar.Collapse>
                </Container>
            </Navbar>


            {/* Modal de Inicio de Sesión */}
            <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Iniciar Sesión")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Usuario")}</Form.Label>
                            <Form.Control type="text" value={user} onChange={(e) => setUser(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Contraseña")}</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">{t("Iniciar Sesión")}</Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p>{t("¿No tienes cuenta?")}<Button variant="link" onClick={() => { setShowLogin(false); setShowRegister(true); }}>{t("Registrarse")}</Button></p>
                    </div>
                    <p className="text-center mt-2">
                        <Button variant="link" onClick={() => {
                            setShowLogin(false);
                            setShowRecovery(true);
                        }}>
                            {t("¿Olvidaste tu contraseña?")}
                        </Button>
                    </p>
                </Modal.Body>
            </Modal>

            {/* Modal de Registro */}
            <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Crear Cuenta")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Usuario")}</Form.Label>
                            <Form.Control type="text" value={user} onChange={(e) => setUser(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Nombre")}</Form.Label>
                            <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Apellido")}</Form.Label>
                            <Form.Control type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Correo Electrónico")}</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Contraseña")}</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("Imagen de Perfil")}</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={(e) => setProfile(e.target.files[0])} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">{t("Registrarse")}</Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p>{t("Tienes una cuenta")}
                            <Button variant="link" onClick={() => { setShowLogin(true); setShowRegister(false); }}>
                                {t("Iniciar Sesión")}
                            </Button>

                        </p>
                    </div>
                </Modal.Body>
            </Modal>


            <Modal show={showRecovery} onHide={() => setShowRecovery(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Recuperar Contraseña")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {recoveryError && <Alert variant="danger">{recoveryError}</Alert>}
                    {recoverySuccess && <Alert variant="success">{recoverySuccess}</Alert>}

                    {!codigoEnviado && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Introduce tu nombre de usuario")}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={userRecovery}
                                    onChange={(e) => setUserRecovery(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" className="w-100" onClick={handleEnviarCodigo}>
                                {t("Enviar código de verificación")}
                            </Button>
                        </>
                    )}

                    {codigoEnviado && !verificado && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Código recibido por correo")}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={codigoIngresado}
                                    onChange={(e) => setCodigoIngresado(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="success" className="w-100" onClick={handleVerificarCodigo}>
                                {t("Verificar código")}
                            </Button>
                        </>
                    )}

                    {verificado && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Nueva contraseña")}</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={nuevaPassword}
                                    onChange={(e) => setNuevaPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="success" className="w-100" onClick={handleCambiarPassword}>
                                {t("Cambiar contraseña")}
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default NavBar;
