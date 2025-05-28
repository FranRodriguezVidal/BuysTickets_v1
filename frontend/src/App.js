import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Administracion from "./components/pages/admins/Administracion";
import Usuarios from "./components/pages/admins/Usuarios";
import Ventas from "./components/pages/admins/Ventas";
import Asientos3D from "./components/pages/Asiento3D";
import EntradaGenerada from "./components/pages/EntradaGenerada";
import Eventos from "./components/pages/Eventos";
import Inicio from "./components/pages/Inicio";
import Licencias from "./components/pages/Licencias";
import AdminRoute from "./components/pages/routeSecure/AdminRoute";
import PrivateRoute from "./components/pages/routeSecure/PrivateRoute";
import Configuracion from "./components/pages/users/Configuracion";
import Entradas from "./components/pages/users/Entradas";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider> {/* ⬅️ Envolvemos toda la app con el contexto */}
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/seleccionar-asientos/:id" element={<Asientos3D />} />

        <Route path="/entrada-generada" element={
          <PrivateRoute>
            <EntradaGenerada />
          </PrivateRoute>} />

          <Route path="/configuracion" element={
            <PrivateRoute>
              <Configuracion />
            </PrivateRoute>} />
          <Route path="/entradas" element={
            <PrivateRoute>
              <Entradas />
            </PrivateRoute>} />

          <Route path="/admin" element={
            <AdminRoute>
              <Administracion />
            </AdminRoute>
          } />

          <Route path="/usuarios" element={
            <AdminRoute>
              <Usuarios />
            </AdminRoute>
          } />

          <Route path="/ventas" element={
            <AdminRoute>
              <Ventas />
            </AdminRoute>
          } />
          <Route path="/licencia" element={<Licencias />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
        <Footer />
      </Router>
    </UserProvider>
  );
}

export default App;
