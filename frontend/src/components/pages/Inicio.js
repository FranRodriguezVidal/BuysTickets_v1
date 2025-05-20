import { useTranslation } from "react-i18next";
import Carrusel from "../Carrusel";
import "./Inicio.css";

export default function Inicio() {
    const { t } = useTranslation();

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
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
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
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
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
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                            <img src="/images/MILLONARIOS VS CRUZ AZUL.png" alt="Millonario vs Cruz azul" className="marquee-image" />
                            <img src="/images/Ecos de la Oscuridad.png" alt="Teatro" className="marquee-image" />
                            <img src="/images/KØRE RAVESYNTH.png" alt="KØRE RAVESYNTH" className="marquee-image" />
                            <img src="/images/IFEMA NASA.png" alt="Exposicion" className="marquee-image" />
                            <img src="/images/JOWKE.png" alt="JOWKE" className="marquee-image" />
                        </div>
                    </div>
                </div>
            </div>
            <Carrusel />
        </div>

    );
}
