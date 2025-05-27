import { createContext, useState } from "react";

export const UserContext = createContext();

function normalizarUsuario(data) {
    return {
        ...data,
        discapacidad: data.discapacidad === true || data.discapacidad === "sí" || data.discapacidad === "true",
        is_premium: data.is_premium === true || data.is_premium === "true" || data.role === "premium"
    };
}

export const UserProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        return usuarioGuardado ? normalizarUsuario(JSON.parse(usuarioGuardado)) : null;
    });

    const [showLogin, setShowLogin] = useState(false);

    const login = (userData) => {
        const userNormalizado = normalizarUsuario(userData);
        localStorage.setItem("usuario", JSON.stringify(userNormalizado));
        setUsuario(userNormalizado);
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <UserContext.Provider value={{
            usuario,
            setUsuario: login,
            logout,
            showLogin,
            setShowLogin,
        }}>
            {children}
        </UserContext.Provider>
    );
};
