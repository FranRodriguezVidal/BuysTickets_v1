import { Carousel, Col, Row } from "react-bootstrap";

const Carrusel = () => {
    return (
        <Carousel>
            <Carousel.Item>
                <Row className="justify-content-center">
                    <Col md={4}>
                        <img
                            className="d-block w-75"
                            src="/images/KØRE RAVESYNTH.png"
                            alt="Evento 1"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-75"
                            src="/images/MILLONARIOS VS CRUZ AZUL.png"
                            alt="Evento 2"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO3.png"
                            alt="Evento 3"
                        />
                    </Col>
                </Row>
            </Carousel.Item>

            <Carousel.Item>
                <Row className="justify-content-center">
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO4.png"
                            alt="Evento 4"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO5.png"
                            alt="Evento 5"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO6.png"
                            alt="Evento 6"
                        />
                    </Col>
                </Row>
                <Carousel.Caption>
                    <h3>Próximos Eventos</h3>
                    <p>No te pierdas lo que viene</p>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
};

export default Carrusel;
