import "./LoadingAnimation.css";

const LoadingAnimation = ({ message = "Cargando acceso seguro..." }) => {
    return (
        <div className="loading-wrapper">
            <div className="floating-shapes">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="shape" />
                ))}
            </div>
            <div className="loading-message">
                <h4>{message || "Cargando..."}</h4>
            </div>
            <div className="line-loader"></div>
        </div>
    );
};

export default LoadingAnimation;
