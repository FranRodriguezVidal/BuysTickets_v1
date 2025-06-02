import { useContext, useState } from "react";
import { UserContext } from "../../../context/UserContext";

export default function PagoExitoso() {
    const { usuario, setUsuario } = useContext(UserContext);
    const [convirtiendo, setConvirtiendo] = useState(false);

    const convertirPremium = async () => {
        const aceptar = window.confirm("⚠️ Al convertir tu cuenta a Premium aceptas los términos, condiciones y licencias de uso. ¿Deseas continuar?");
        if (!aceptar) return;

        setConvirtiendo(true);

        try {
            const res = await fetch("http://localhost:5000/convert-to-premium", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ user_id: usuario.user }),
            });

            const data = await res.json();

            if (data.success) {
                setUsuario({
                    ...usuario,
                    role: "premium",
                    subscription_expiry_date: data.expiry_date,
                });
                alert("🎉 ¡Tu cuenta ha sido actualizada a Premium!");
                window.location.href = "/configuracion";
            } else {
                alert(data.message || "No se pudo convertir a Premium.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al conectar con el servidor.");
        } finally {
            setConvirtiendo(false);
        }
    };

    return (
        <div className="container mt-5 text-center">
            <h2 className="text-success">¡Gracias por tu compra!</h2>
            <p className="mt-3">Para finalizar, debes aceptar convertir tu cuenta a Premium.</p>
            <p className="text-muted">
                Al hacerlo, aceptas los términos, condiciones y licencias de uso.
                <br />
                En caso de no aceptar o salir de la ventana, la cuenta no se convertirá en Premium.
            </p>

            <button
                className="btn btn-warning my-3"
                onClick={convertirPremium}
                disabled={convirtiendo}
            >
                {convirtiendo ? "Convirtiendo..." : "Convertirme en Premium"}
            </button>
        </div>
    );
}
