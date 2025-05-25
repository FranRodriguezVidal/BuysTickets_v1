import { createContext, useState } from "react";

export const UserContext = createContext();
//const [showLogin, setShowLogin] = useState(false);

export const UserProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const [showLogin, setShowLogin] = useState(false); // ✅ ahora está dentro

    const login = (userData) => {
        localStorage.setItem("usuario", JSON.stringify(userData));
        setUsuario(userData);
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
            setShowLogin, // ✅ ahora lo exportas
        }}>
            {children}
        </UserContext.Provider>
    );
};
