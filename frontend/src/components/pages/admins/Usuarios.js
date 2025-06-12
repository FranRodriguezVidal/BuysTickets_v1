import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";

export default function Usuarios() {
  const { t } = useTranslation();

  const [userData, setUserData] = useState({
    id: null,
    user: "",
    password: "",
    nombre: "",
    apellido: "",
    email: "",
    profile: null,
    role: "estandar",
    discapacidad: "no",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editMode, setEditMode] = useState(false);

  const API_BASE_URL = "https://buystickets-v1.onrender.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setUserData((prev) => ({ ...prev, profile: e.target.files[0] }));
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/lista-usuarios-adminControl`);
      if (!response.data.success || !Array.isArray(response.data.usuarios)) {
        setUsuarios([]);
        setErrorMsg("No se encontraron usuarios.");
      } else {
        const usuariosMapeados = response.data.usuarios.map((user) => ({
          id: user.id,
          user: user.user,
          role: user.role,
          nombre: user.name || "",
          apellido: user.surname || "",
          email: user.email,
          discapacidad: user.discapacidad,
          profile: user.profile,
        }));
        setUsuarios(usuariosMapeados);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setErrorMsg("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (key !== "id" && value !== null) {
        formData.append(key, value);
      }
    });

    try {
      const url = editMode
        ? `${API_BASE_URL}/admin/update-user-adminControl`
        : `${API_BASE_URL}/admin/register-adminControl`;

      if (editMode) formData.append("id", userData.id);

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert(editMode ? "Usuario actualizado" : "Usuario creado exitosamente");
        fetchUsuarios();
        setShowModal(false);
        setUserData({
          id: null,
          user: "",
          password: "",
          nombre: "",
          apellido: "",
          email: "",
          profile: null,
          role: "estandar",
          discapacidad: "no",
        });
        setEditMode(false);
      } else {
        alert(response.data.message || "Error al procesar el usuario.");
      }
    } catch (error) {
      console.error("Error en el registro/actualización:", error);
      alert("Error al procesar el usuario.");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = (user) => {
    setUserData({
      id: user.id,
      user: user.user,
      password: "",
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      profile: null,
      role: user.role,
      discapacidad: user.discapacidad,
    });
    setShowModal(true);
    setEditMode(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Eliminar a ${user.user}?`)) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/admin/delete-user-adminControl/${user.id}`
        );
        if (response.data.success) {
          alert(`Usuario ${user.user} eliminado.`);
          fetchUsuarios();
          setSelectedUser(null);
        } else {
          alert(response.data.message || "No se pudo eliminar el usuario.");
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar usuario: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-primary text-center mb-4">{t("Usuarios registrados")}</h1>

      <div className="text-center mb-4">
        <Button variant="primary" onClick={() => { setShowModal(true); setEditMode(false); }}>
          {t("Crear Usuario")}
        </Button>
      </div>

      {/* Modal de creación/edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? t("Editar Usuario") : t("Crear Usuario")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {["user", "password", "nombre", "apellido", "email"].map((field) => (
              <div key={field} className="mb-3">
                <label className="form-label">{t(field.charAt(0).toUpperCase() + field.slice(1))}</label>
                <input
                  type={field === "password" ? "password" : "text"}
                  className="form-control"
                  name={field}
                  value={userData[field]}
                  onChange={handleInputChange}
                  required={field !== "password" || !editMode}
                />
              </div>
            ))}
            <div className="mb-3">
              <label className="form-label">{t("Foto de perfil")}</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">{t("Rol")}</label>
              <select className="form-control" name="role" value={userData.role} onChange={handleInputChange}>
                <option value="estandar">Estandar</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">{t("Discapacidad")}</label>
              <select className="form-control" name="discapacidad" value={userData.discapacidad} onChange={handleInputChange}>
                <option value="no">No</option>
                <option value="sí">Sí</option>
              </select>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                {editMode ? t("Actualizar Usuario") : t("Crear Usuario")}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Lista de usuarios */}
      {loading ? (
        <p className="text-center">{t("Cargando usuarios...")}</p>
      ) : errorMsg ? (
        <p className="text-danger text-center">{errorMsg}</p>
      ) : usuarios.length > 0 ? (
        <div className="row">
          {usuarios.map((user) => (
            <div key={user.id} className="col-md-3 mb-4" onClick={() => handleUserClick(user)} style={{ cursor: "pointer" }}>
              <div className="card shadow-sm text-center border">
                <div className="card-body">

                  {user.profile ? (
                    <img
                      src={`data:image/png;base64,${user.profile}`}
                      alt={user.user}
                      className="rounded-circle mb-2"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle mb-2 d-flex justify-content-center align-items-center bg-secondary text-white"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaUser size={30} />
                    </div>
                  )}
                  <h5 className="text-primary">{user.user}</h5>
                  <p className="text-muted mb-0">{user.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">{t("No hay usuarios disponibles.")}</p>
      )}

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <Modal show={!!selectedUser} onHide={() => setSelectedUser(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t("Detalles de Usuario")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              {selectedUser.profile ? (
                <img
                  src={`data:image/png;base64,${selectedUser.profile}`}
                  alt={selectedUser.user}
                  className="rounded-circle mb-3"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary text-white mb-3 d-flex justify-content-center align-items-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaUser size={40} />
                </div>
              )}
              <h4>{selectedUser.user}</h4>
              <p><strong>{t("Nombre")}:</strong> {selectedUser.nombre}</p>
              <p><strong>{t("Apellido")}:</strong> {selectedUser.apellido}</p>
              <p><strong>{t("Email")}:</strong> {selectedUser.email}</p>
              <p><strong>{t("Rol")}:</strong> {t(selectedUser.role)}</p>
              <p><strong>{t("Discapacidad")}:</strong> {selectedUser.discapacidad === "sí" ? t("Sí") : t("No")}</p>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-warning" onClick={() => handleEdit(selectedUser)}>{t("Editar")}</button>
                <button className="btn btn-danger" onClick={() => handleDelete(selectedUser)}>{t("Eliminar")}</button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
