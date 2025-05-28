import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const Configuracion = () => {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const { t } = useTranslation();
    const { usuario, logout } = useContext(UserContext);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [editMessage, setEditMessage] = useState("");
    const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [nombreSolicitud, setNombreSolicitud] = useState("");
    const [apellidoSolicitud, setApellidoSolicitud] = useState("");
    const [dniSolicitud, setDniSolicitud] = useState("");
    const [gradoDiscapacidad, setGradoDiscapacidad] = useState("");
    const [archivoDiscapacidad, setArchivoDiscapacidad] = useState(null);
    const [estadoDiscapacidad, setEstadoDiscapacidad] = useState(null);
    const [reporte, setReporte] = useState("");
    const location = useLocation();
    const [estadoSolicitud, setEstadoSolicitud] = useState("");

    useEffect(() => {
        const fetchEstado = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/estado-discapacidad/${usuario.user}`);
                if (res.data.success) {
                    setEstadoSolicitud(res.data.estado);
                }
            } catch (err) {
                console.error("Error al obtener el estado de discapacidad:", err);
            }
        };

        fetchEstado();
    }, [usuario]);

    useEffect(() => {
        if (location.hash) {
            const el = document.getElementById(location.hash.substring(1));
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [location]);

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || "");
            setApellido(usuario.apellido || "");
            setEmail(usuario.email || "");
            setSubscriptionExpiry(usuario.subscription_expiry_date || null);
        }
    }, [usuario]);

    useEffect(() => {
        const obtenerEstado = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/solicitudes/estado-discapacidad/${usuario.user}`);
                if (res.data.success) {
                    setEstadoDiscapacidad(res.data.estado);
                } else {
                    setEstadoDiscapacidad("error");
                }
            } catch (error) {
                console.error("Error al obtener estado discapacidad:", error);
                setEstadoDiscapacidad("error");
            }
        };

        if (usuario && usuario.user) {
            obtenerEstado();
        }
    }, [usuario]);



    if (!usuario) {
        return null;
    }

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file); // Establecer el archivo seleccionado
        }
    };

    const handleSaveChanges = async () => {
        setEditMessage("");

        if (newPassword && newPassword !== confirmPassword) {
            setEditMessage(t("Las contraseñas no coinciden"));
            return;
        }

        const formData = new FormData();
        formData.append("user", usuario?.user);
        formData.append("nombre", nombre);
        formData.append("apellido", apellido);
        formData.append("email", email);
        if (newPassword) {
            formData.append("newPassword", newPassword);
        }
        if (profileImage) {
            formData.append("profile", profileImage); // Añadir el archivo de perfil
        }

        // Llamar al backend para guardar los cambios
        try {
            const response = await axios.post("http://localhost:5000/update-user", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Asegúrate de enviar el FormData correctamente
                },
            });

            if (response.data.success) {
                setEditMessage(t("Cambios guardados correctamente"));
            } else {
                setEditMessage(t("Hubo un error al guardar los cambios"));
            }
        } catch (err) {
            setEditMessage(t("Error al conectar con el servidor"));
        }
    };

    const handleDeleteAccount = async () => {
        setMessage("");
        setError("");
        setLoadingDelete(true);

        if (!password) {
            setError(t("Debes ingresar tu contraseña para confirmar."));
            setLoadingDelete(false);
            return;
        }

        try {
            const response = await axios.delete("http://localhost:5000/delete-user", {
                data: {
                    user: usuario?.user,
                    password: password,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setShowPasswordModal(false);
                const interval = setInterval(() => {
                    setCountdown((prev) => prev - 1);
                }, 1000);
                setTimeout(() => {
                    clearInterval(interval);
                    logout();
                    window.location.href = "/inicio";
                }, 3000);
            } else {
                setError(response.data.message || t("Error al eliminar la cuenta."));
            }
        } catch (err) {
            setError(err.response?.data?.message || t("Error al conectar con el servidor."));
        } finally {
            setLoadingDelete(false);
        }
    };

    // Lógica para enviar solicitud de discapacidad
    const handleEnviarSolicitudDiscapacidad = async () => {
        const formData = new FormData();
        formData.append("nombre", nombreSolicitud);
        formData.append("apellido", apellidoSolicitud);
        formData.append("dni", dniSolicitud);
        formData.append("grado_discapacidad", gradoDiscapacidad);
        formData.append("usuario", usuario.user);
        if (archivoDiscapacidad) {
            formData.append("archivo", archivoDiscapacidad);
        }

        try {
            const res = await axios.post("http://localhost:5000/solicitudes/solicitar-discapacidad", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                alert("Solicitud registrada correctamente.");
                // Aquí continúa flujo normal
            } else {
                alert(res.data.message || "Error al enviar la solicitud.");
            }

        } catch (err) {
            console.error("Error recibido del servidor:", err.response?.data || err);
            alert(err.response?.data?.message || "Error al conectar con el servidor.");
        }

    };


    const handleEnviarReporte = async () => {
        if (!reporte) return;

        try {
            const response = await axios.post("http://localhost:5000/reportes/reportar-error", {
                user: usuario.user,
                reporte: reporte,
                estado: "pendiente" // Estado inicial del reporte
            });

            if (response.data.success) {
                alert(t("Reporte enviado exitosamente."));
                setReporte(""); // Limpiar el campo de reporte
            } else {
                alert(t("Hubo un error al enviar el reporte."));
            }
        } catch (err) {
            console.error(err);
            alert(t("Error al conectar con el servidor."));
        }
    };

    return (
        <div className="bg-white py-5">
            {usuario.discapacidad === true && (
                <div className="text-center mb-3">
                    <span className="badge bg-success">♿ Cuenta con discapacidad activa</span>
                </div>
            )}
            {/* Información Personal */}
            <section className="container my-5 p-4 rounded shadow-sm bg-light border">
                <h2 className="text-primary text-center mb-4">{t("Configuración")}</h2>
                <h4 className="text-center mb-4">{t("Editar información personal")}</h4>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Nombre")}</Form.Label>
                        <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Apellido")}</Form.Label>
                        <Form.Control type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Correo Electrónico")}</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Nueva Contraseña")}</Form.Label>
                        <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Confirmar Contraseña")}</Form.Label>
                        <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Imagen de Perfil")}</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleProfileImageChange} />
                    </Form.Group>
                    {editMessage && <Alert variant="info">{editMessage}</Alert>}
                    <div className="d-grid">
                        <Button variant="primary" onClick={handleSaveChanges}>{t("Guardar cambios")}</Button>
                    </div>

                    <p className="text-muted text-center mt-3" style={{ fontSize: "0.9rem" }}>
                        {t("Los cambios se verán reflejados la próxima vez que inicies sesión.")}
                    </p>
                </Form>
            </section>

            {/* Membresía Premium */}
            <section id="premium" className="container my-5 p-4 rounded shadow-sm bg-light border">
                <h2 className="text-warning text-center mb-2">{t("¿Quieres disfrutar de una cuenta Premium?")}</h2>
                <h5 className="text-center mb-4 text-muted">
                    {t("Disfruta de beneficios exclusivos como contenido adicional, descuentos y prioridad en eventos.")}
                </h5>

                {usuario.is_premium || usuario.role === "premium" ? (
                    <div className="alert alert-success text-center">
                        {t("Eres un usuario Premium.")} <br />
                        {t("Tu suscripción vence el")} {subscriptionExpiry}.
                    </div>
                ) : (
                    <div className="alert alert-warning text-center">
                        {t("Eres un usuario estándar. Actualiza tu cuenta para acceder a todas las ventajas.")}
                    </div>
                )}
            </section>


            {/* Solicitud de Discapacidad */}
            <section id="discapacidad" className="container my-5 p-4 rounded shadow-sm bg-light border">
                <h2 className="text-primary text-center mb-2">{t("¿Posees alguna discapacidad?")}</h2>
                <h5 className="text-muted text-center mb-4">
                    {t("Solicita una cuenta especial y accede a beneficios como prioridad en eventos, descuentos exclusivos y atención preferente.")}
                </h5>

                <div className="text-center mb-4">
                    <Button variant="primary" onClick={() => setShowSolicitudModal(true)}>
                        {t("Solicitar cuenta con discapacidad")}
                    </Button>
                </div>

                <Modal show={showSolicitudModal} onHide={() => setShowSolicitudModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t("Solicitud de cuenta con discapacidad")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Nombre")}</Form.Label>
                                <Form.Control value={nombreSolicitud} onChange={(e) => setNombreSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Apellido")}</Form.Label>
                                <Form.Control value={apellidoSolicitud} onChange={(e) => setApellidoSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("DNI")}</Form.Label>
                                <Form.Control value={dniSolicitud} onChange={(e) => setDniSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Grado de discapacidad")}</Form.Label>
                                <Form.Control value={gradoDiscapacidad} onChange={(e) => setGradoDiscapacidad(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Informe médico o certificado")}</Form.Label>
                                <Form.Control type="file" onChange={(e) => setArchivoDiscapacidad(e.target.files[0])} accept="application/pdf,image/*" />
                            </Form.Group>
                            <Button
                                className="w-100"
                                onClick={handleEnviarSolicitudDiscapacidad}
                                disabled={!nombreSolicitud || !apellidoSolicitud || !dniSolicitud || !gradoDiscapacidad || !archivoDiscapacidad}
                            >
                                {t("Enviar solicitud")}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {estadoDiscapacidad && (
                    <Alert
                        variant={
                            estadoDiscapacidad === "aprobada"
                                ? "success"
                                : estadoDiscapacidad === "rechazada"
                                    ? "danger"
                                    : "secondary"
                        }
                        className="mt-3 text-center"
                    >
                        {t("Estado de la solicitud")}:{" "}
                        {estadoDiscapacidad === "aprobada"
                            ? t("✅ Aprobada (cuenta con discapacidad activa)")
                            : estadoDiscapacidad === "rechazada"
                                ? t("❌ Rechazada")
                                : estadoDiscapacidad === "no solicitado"
                                    ? t("⚠️ Todavía no se ha solicitado")
                                    : t("Cargando...")}
                    </Alert>
                )}


            </section>


            {/* Reporte de errores */}
            <section className="container my-5 p-4 rounded shadow-sm bg-light border">
                <h2 className="text-primary mb-2 text-center">{t("Reportes de Errores o Fallos")}</h2>
                <h5 className="text-muted text-center mb-4">
                    {t("Utiliza este apartado para informar sobre errores, fallos o cualquier actividad sospechosa que detectes.")}
                </h5>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Describe el error o fallo")}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={reporte}
                            onChange={(e) => setReporte(e.target.value)}
                            placeholder={t("Escribe el reporte aquí...")}
                        />
                    </Form.Group>
                    <div className="d-grid">
                        <Button
                            variant="primary"
                            onClick={handleEnviarReporte}
                            disabled={!reporte}
                        >
                            {t("Enviar reporte")}
                        </Button>
                    </div>
                </Form>
            </section>


            {/* Zona peligrosa */}
            <section className="container my-5 p-4 rounded shadow-sm bg-light border">
                <h2 className="text-danger text-center mb-4">{t("Zona peligrosa")}</h2>
                <h5 className="text-center text-muted mb-4">{t("Eliminar cuenta")}</h5>
                <ul className="text-start px-3">
                    <li>{t("No podrás comprar más entradas")}</li>
                    <li>{t("Toda tu información será eliminada permanentemente")}</li>
                    <li>{t("Las entradas impresas o descargadas podrían seguir siendo válidas, pero no podrás acceder a ellas desde tu cuenta")}</li>
                </ul>
                <div className="text-center">
                    <Button variant="danger" onClick={() => setShowPasswordModal(true)}>
                        {t("Borrar mi cuenta")}
                    </Button>
                </div>
                {message && (
                    <Alert variant="success" className="mt-3 text-center">
                        {message}<br />{t("Redirigiendo en")} {countdown} {t("segundos...")}
                    </Alert>
                )}
                {error && <Alert variant="danger" className="mt-3 text-center">{error}</Alert>}
            </section>

            {/* Modal confirmación de eliminación */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Confirmar eliminación de cuenta")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message ? (
                        <Alert variant="success">{message}</Alert>
                    ) : (
                        <Form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Contraseña")}</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("Introduce tu contraseña")}
                                    required
                                />
                            </Form.Group>
                            <Button variant="danger" type="submit" className="w-100" disabled={loadingDelete}>
                                {loadingDelete ? (
                                    <><Spinner animation="border" size="sm" className="me-2" />{t("Cargando...")}</>
                                ) : (
                                    t("Confirmar y eliminar cuenta")
                                )}
                            </Button>
                        </Form>
                    )}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Modal.Body>
            </Modal>
        </div>
    );

};

export default Configuracion;
