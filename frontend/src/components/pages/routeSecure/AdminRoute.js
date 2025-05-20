import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import LoadingAnimation from "./LoadingAnimation"; // Ajusta ruta
const AdminRoute = ({ children }) => {
    const { usuario } = useContext(UserContext);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!usuario || usuario.role !== "admin") {
                setRedirect(true);
            }
            setCheckingAuth(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [usuario]);

    if (checkingAuth) {
        return <LoadingAnimation message="Validando permisos de administrador..." />;
    }

    if (redirect) {
        return <Navigate to="/inicio" />;
    }

    return children;
};

export default AdminRoute;
