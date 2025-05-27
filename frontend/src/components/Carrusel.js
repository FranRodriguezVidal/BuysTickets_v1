import { Carousel, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Carrusel.css";

const Carrusel = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="carrusel-container">
            <Carousel interval={5000} indicators={false}>
                <Carousel.Item>
                    <Row className="justify-content-center text-center">
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/KØRE RAVESYNTH.png"
                                alt="KØRE RAVESYNTH"
                                onClick={() => navigate("/eventos?search=KØRE%20RAVESYNTH&abrir=1")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/MILLONARIOS VS CRUZ AZUL.png"
                                alt="MILLONARIOS VS CRUZ AZUL"
                                onClick={() => navigate("/eventos?search=MILLONARIOS%20VS%20CRUZ%20AZUL&abrir=2")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/JOWKE.png"
                                alt="JOWKE"
                                onClick={() => navigate("/eventos?search=JOWKE&abrir=3")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/IFEMA NASA.png"
                                alt="IFEMA NASA"
                                onClick={() => navigate("/eventos?search=IFEMA%20NASA&abrir=4")}
                            />
                        </Col>
                    </Row>
                </Carousel.Item>

                <Carousel.Item>
                    <Row className="justify-content-center text-center">
                        <Col md={4}>
                            <img
                                className="evento-img w-75"
                                src="/images/Ecos de la Oscuridad.png"
                                alt="Ecos de la Oscuridad"
                                onClick={() => navigate("/eventos?search=Ecos%20de%20la%20Oscuridad&abrir=5")}
                            />
                        </Col>
                        <Col md={4}>
                            <div className="slide-text-wrapper d-flex justify-content-center align-items-center">
                                <div className="slide-text text-light text-center px-4">
                                    <h2 className="carrusel-titulo">🎉{t("Eventos Destacados")}🎉</h2>
                                    <p className="carrusel-subtitulo">
                                        {t("Una mezcla explosiva de espectáculos")}
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <img
                                className="evento-img w-75"
                                src="/images/CORRER.png"
                                alt="CORRER"
                                onClick={() => navigate("/eventos?search=CORRER&abrir=6")}
                            />
                        </Col>
                    </Row>
                </Carousel.Item >

                <Carousel.Item>
                    <Row className="justify-content-center text-center">
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/CORTOMETREJE.png"
                                alt="CORTOMETREJE"
                                onClick={() => navigate("/eventos?search=CORTOMETREJE&abrir=7")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/RAVE.png"
                                alt="RAVE"
                                onClick={() => navigate("/eventos?search=RAVE&abrir=8")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/THEATRE DEAF.png"
                                alt="THEATRE DEAF"
                                onClick={() => navigate("/eventos?search=THEATRE%20DEAF&abrir=9")}
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/mundial.png"
                                alt="Mundial"
                                onClick={() => navigate("/eventos?search=Mundial&abrir=10")}
                            />
                        </Col>
                    </Row>
                </Carousel.Item >
            </Carousel >
        </div >
    );
};

export default Carrusel;
