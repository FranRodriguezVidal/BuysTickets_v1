import { Carousel, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./Carrusel.css"; // Asegúrate de que el CSS esté bien importado

const Carrusel = () => {
    const { t } = useTranslation();  // ✅ Esta línea es fundamental
    return (
        <div className="carrusel-container">
            <Carousel interval={5000} indicators={false}>
                <Carousel.Item>
                    <Row className="justify-content-center text-center">
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/KØRE RAVESYNTH.png"
                                alt="Evento 1"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/MILLONARIOS VS CRUZ AZUL.png"
                                alt="Evento 2"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/JOWKE.png"
                                alt="Evento 3"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/IFEMA NASA.png"
                                alt="Evento 4"
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
                                alt="Evento 5"
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
                                alt="Evento 6"
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
                                alt="Evento 7"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/RAVE.png"
                                alt="Evento 8"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/THEATRE DEAF.png"
                                alt="Evento 9"
                            />
                        </Col>
                        <Col md={3}>
                            <img
                                className="evento-img"
                                src="/images/.png"
                                alt="Evento 10"
                            />
                        </Col>
                    </Row>
                </Carousel.Item >
            </Carousel >
        </div >
    );
};

export default Carrusel;
