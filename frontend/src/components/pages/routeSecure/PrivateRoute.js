import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import LoadingAnimation from "./LoadingAnimation"; // Ajusta ruta

const PrivateRoute = ({ children }) => {
    const { usuario } = useContext(UserContext);
    const [showSpinner, setShowSpinner] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        // Esperamos 2 segundos en todos los casos para animación
        const timer = setTimeout(() => {
            if (!usuario) {
                setShouldRedirect(true);
            }
            setShowSpinner(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [usuario]);

if (showSpinner) {
    return <LoadingAnimation message="Verificando sesión de usuario..." />;
}

    if (shouldRedirect) {
        return <Navigate to="/inicio" />;
    }

    return children;
};

export default PrivateRoute;
