import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function EntradaGeneradaN() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");
  const evento = queryParams.get("evento");

  const [entrada, setEntrada] = useState(null);

  useEffect(() => {
    async function fetchEntrada() {
      try {
        const response = await fetch(
          `/tickets-por-email?email=${email}&evento=${evento}`
        );
        const data = await response.json();
        if (data.success) {
          setEntrada(data.entrada);
        } else {
          alert("Entrada no encontrada");
        }
      } catch (error) {
        console.error("Error al obtener la entrada:", error);
      }
    }
    if (email && evento) {
      fetchEntrada();
    }
  }, [email, evento]);

  const descargarPDF = () => {
    if (!entrada) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("🎫 Entrada Evento", 20, 20);
    doc.setFontSize(12);
    doc.text(`Evento: ${entrada.nombre_evento}`, 20, 40);
    doc.text(`Nombre: ${entrada.nombre_comprador}`, 20, 50);
    doc.text(`Email: ${entrada.email_comprador}`, 20, 60);
    doc.text(`Fecha de Compra: ${entrada.fecha_compra}`, 20, 70);
    doc.text(`${entrada.asiento}`, 20, 80);
    doc.save("entrada.pdf");
  };

  if (!entrada) return <div>Cargando entrada...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Entrada Confirmada</h2>
      <div className="card p-4">
        <p><strong>Evento:</strong> {entrada.nombre_evento}</p>
        <p><strong>Nombre:</strong> {entrada.nombre_comprador}</p>
        <p><strong>Email:</strong> {entrada.email_comprador}</p>
        <p><strong>Fecha:</strong> {entrada.fecha_compra}</p>
        <p><strong>{entrada.asiento}</strong></p>
        <button className="btn btn-primary mt-3" onClick={descargarPDF}>
          Descargar PDF
        </button>
      </div>
    </div>
  );
}