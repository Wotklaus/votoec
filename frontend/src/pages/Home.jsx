import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css";
import api from "../api";

function Home() {
  const [candidatos, setCandidatos] = useState([]);
  const [voto, setVoto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [votoEmitido, setVotoEmitido] = useState(false);

  const email = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarCandidatos() {
      try {
        const respuesta = await api.get("/api/candidatos");
        const baseCandidatos = respuesta.data || [];

        const candidatosConImagen = baseCandidatos.map((candidato) => {
          let imagen = "/img/default.jpeg";

          if (candidato.id === 1) imagen = "/img/espacios.jpg";
          else if (candidato.id === 2) imagen = "/img/home.jpg";
          else if (candidato.id === 3) imagen = "/img/tecnologia.jpeg";

          return { ...candidato, imagen };
        });

        setCandidatos(candidatosConImagen);
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
      }
    }

    cargarCandidatos();
  }, []);

  const votar = async (id) => {
    if (!email) {
      setMensaje("❌ No se encontró el email del usuario. Por favor inicia sesión.");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await api.post("/api/votar", {
        email,
        opcion: id,
      });

      if (respuesta.data.success) {
        const { txHash } = respuesta.data;
        setVoto(id);
        setMensaje(`✅ Voto emitido con éxito. TxHash: ${txHash}`);
        setVotoEmitido(true);
      } else {
        setMensaje("❌ Error al emitir voto: " + (respuesta.data.error || "desconocido"));
      }
    } catch (error) {
      console.error("Error enviando voto:", error);
      setMensaje("❌ Ya votaste");
    } finally {
      setCargando(false);
    }
  };

  const mostrarBotonVolverPerfil = mensaje.includes("Ya votaste");

  return (
    <div className="home-page">
      <div className="home-container">
        {votoEmitido ? (
          <>
            <h1>Gracias por votar, {email}</h1>
            <p className={`message ${mensaje.startsWith("✅") ? "success" : "error"}`}>{mensaje}</p>
            <div className="menu-buttons">
              <button onClick={() => navigate("/blockchain")}>Ver resultados</button>
              <button onClick={() => navigate("/customer")}>Perfil</button>
            </div>
          </>
        ) : (
          <>
            <h2>¿En qué área considerarías más importante invertir recursos adicionales para el desarrollo de la Universidad Central?</h2>

            <div className="buttons-container">
              {candidatos.map((op) => (
                <button
                  key={op.id}
                  onClick={() => votar(op.id)}
                  disabled={cargando}
                  className={`vote-button ${voto === op.id ? "selected" : "not-selected"}`}
                >
                  <img
                    src={op.imagen}
                    alt={`Imagen de ${op.nombre}`}
                    className="vote-image"
                  />
                  <div><strong>{op.nombre}</strong></div>
                  <div>{op.descripcion}</div>
                </button>
              ))}
            </div>

            {mensaje && (
              <div className={`message ${mensaje.startsWith("✅") ? "success" : "error"}`}>
                {mensaje}
              </div>
            )}

            {mostrarBotonVolverPerfil && (
              <div className="menu-buttons">
                <button onClick={() => navigate("/customer")}>Volver al perfil</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
