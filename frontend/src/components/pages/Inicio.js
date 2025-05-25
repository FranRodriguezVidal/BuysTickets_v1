import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Carrusel from "../Carrusel";
import "./Inicio.css";

export default function Inicio() {
    const { t } = useTranslation();
    const [showCookies, setShowCookies] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("cookiesAccepted")) {
            setShowCookies(true);
        }
    }, []);

    return (
        <div className="marquee-container bg-dark">
            <div className="marquee-content">
                <div className="marquee-track">
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/CORRER.png" alt="CORRER" className="marquee-image" />
                            <img src="/images/CORTOMETREJE.png" alt="CORTOMETREJE" className="marquee-image" />
                            <img src="/images/RAVE.png" alt="RAVE" className="marquee-image" />
                            <img src="/images/THEATRE DEAF.png" alt="THEATRE DEAF" className="marquee-image" />
                            <img src="/images/mundial.png" alt="mundial" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                        </div>
                    </div>
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/CORRER.png" alt="CORRER" className="marquee-image" />
                            <img src="/images/CORTOMETREJE.png" alt="CORTOMETREJE" className="marquee-image" />
                            <img src="/images/RAVE.png" alt="RAVE" className="marquee-image" />
                            <img src="/images/THEATRE DEAF.png" alt="THEATRE DEAF" className="marquee-image" />
                            <img src="/images/mundial.png" alt="mundial" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                        </div>
                    </div>
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/CORRER.png" alt="CORRER" className="marquee-image" />
                            <img src="/images/CORTOMETREJE.png" alt="CORTOMETREJE" className="marquee-image" />
                            <img src="/images/RAVE.png" alt="RAVE" className="marquee-image" />
                            <img src="/images/THEATRE DEAF.png" alt="THEATRE DEAF" className="marquee-image" />
                            <img src="/images/mundial.png" alt="mundial" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                        </div>
                    </div>
                </div>
            </div>
            <Carrusel />
            {showCookies && (
                <div className="position-fixed bottom-0 start-0 end-0 bg-light text-dark d-flex flex-column flex-md-row justify-content-between align-items-center p-3 shadow border-top" style={{ zIndex: 1080 }}>
                    <span className="mb-2 mb-md-0">
                        {t("Este sitio utiliza cookies para mejorar la experiencia del usuario.")}
                    </span>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => {
                                localStorage.setItem("cookiesAccepted", "true");
                                setShowCookies(false);
                            }}
                        >
                            {t("Aceptar")}
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowSettings(true)}>
                            {t("Configurar")}
                        </button>
                    </div>
                </div>
            )}
            {showSettings && (
                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1081 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-secondary-subtle">
                                <h5 className="modal-title text-secondary">{t("Configuración de Cookies")}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSettings(false)}></button>
                            </div>
                            <div className="modal-body bg-light">
                                <div className="mb-3">
                                    <h6>{t("Cookies Funcionales")}</h6>
                                    <p className="text-muted small">{t("Estas cookies son necesarias para el correcto funcionamiento del sitio.")}</p>
                                </div>
                                <div className="mb-3">
                                    <h6>{t("Cookies Analíticas")}</h6>
                                    <p className="text-muted small">{t("Estas cookies nos ayudan a entender cómo los usuarios interactúan con el sitio.")}</p>
                                </div>
                                <div className="mb-3">
                                    <h6>{t("Cookies de Publicidad")}</h6>
                                    <p className="text-muted small">{t("Estas cookies se utilizan para mostrar anuncios relevantes.")}</p>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>{t("Cancelar")}</button>
                                <button className="btn btn-primary" onClick={() => {
                                    localStorage.setItem("cookiesAccepted", "true");
                                    setShowSettings(false);
                                    setShowCookies(false);
                                }}>
                                    {t("Guardar Preferencias")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}
