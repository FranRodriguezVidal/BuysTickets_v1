import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function Usuarios() {
  const { t } = useTranslation();

  const [userData, setUserData] = useState({
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
    const response = await axios.get("http://localhost:5000/admin/lista-usuarios-adminControl");

 if (response.data.success === false || !Array.isArray(response.data.usuarios)) {
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
    console.error("Error al cargar usuarios:", error.response || error.message || error);
    setErrorMsg("Error al cargar la lista de usuarios.");
    setUsuarios([]);
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
      formData.append(key, value);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/admin/register-adminControl",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        alert("Usuario creado exitosamente");
        fetchUsuarios();
        setShowModal(false);
        // Limpiar formulario
        setUserData({
          user: "",
          password: "",
          nombre: "",
          apellido: "",
          email: "",
          profile: null,
          role: "estandar",
          discapacidad: "no",
        });
      } else {
        alert(response.data.message || "Error al crear el usuario.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al crear el usuario.");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = (user) => {
    alert(`Editar usuario: ${user.user}`);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Eliminar a ${user.user}?`)) {
      try {
        await axios.delete(`http://localhost:5000/admin/delete-user-adminControl/${user.id}`);
        alert(`Usuario ${user.user} eliminado.`);
        fetchUsuarios();
        setSelectedUser(null);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar usuario.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1>{t("Usuarios registrados")}</h1>

      <Button variant="primary" className="my-3" onClick={() => setShowModal(true)}>
        Crear Usuario
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {["user", "password", "nombre", "apellido", "email"].map((field) => (
              <div key={field} className="mb-3">
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  className="form-control"
                  name={field}
                  value={userData[field]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}

            <div className="mb-3">
              <label className="form-label">Foto de perfil</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select
                className="form-control"
                name="role"
                value={userData.role}
                onChange={handleInputChange}
              >
                <option value="estandar">Estandar</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Discapacidad</label>
              <select
                className="form-control"
                name="discapacidad"
                value={userData.discapacidad}
                onChange={handleInputChange}
              >
                <option value="no">No</option>
                <option value="sí">Sí</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Crear Usuario
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : errorMsg ? (
        <p className="text-danger">{errorMsg}</p>
      ) : usuarios.length > 0 ? (
        <div className="row">
          {usuarios.map((user) => (
            <div
              key={user.id}
              className="col-md-3 mb-3"
              style={{ cursor: "pointer" }}
              onClick={() => handleUserClick(user)}
            >
              <div className="card text-center">
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
                      className="rounded-circle mb-2"
                      style={{ width: "60px", height: "60px", background: "#ccc" }}
                    ></div>
                  )}
                  <h5>{user.user}</h5>
                  <p>{user.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay usuarios disponibles.</p>
      )}

      {selectedUser && (
        <div className="card mt-4">
          <div className="card-body">
            <h3>Detalles de {selectedUser.user}</h3>
            <p>
              <strong>Nombre:</strong> {selectedUser.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {selectedUser.apellido}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Rol:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Discapacidad:</strong> {selectedUser.discapacidad}
            </p>
            <div>
              <button className="btn btn-warning me-2" onClick={() => handleEdit(selectedUser)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedUser)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
