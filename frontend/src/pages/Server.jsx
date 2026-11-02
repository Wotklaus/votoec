import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Server = () => {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [txHash, setTxHash] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const navigate = useNavigate();

  const fetchData = async (endpoint) => {
    setLoading(true);
    setResultado(null);
    try {
      const res = await api.get(endpoint);
      setResultado(res.data);
    } catch (err) {
      setResultado({ error: "Error al consultar el endpoint" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#1f1f1f",
    color: "#eee",
    marginRight: "0.5rem",
    width: "300px"
  };

  const buttonStyle = {
    padding: "0.6rem 1rem",
    backgroundColor: "#00ffc3",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
  };

  const sectionTitle = {
    color: "#00ffc3",
    marginBottom: "1rem"
  };

  return (
    <div style={{
      padding: "2rem",
      backgroundColor: "#121212",
      minHeight: "100vh",
      color: "#f0f0f0",
      fontFamily: "Segoe UI, Roboto, sans-serif"
    }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#00ffc3" }}>
        Smart Contract
      </h2>

      {/* Panel de consultas */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {[
          { label: "Wallets", path: "/api/mongo/usuarios" },
          { label: "User", path: "/api/pg/usuarios" },
          { label: "Blockchain", path: "/api/usuarios/full" },
          { label: "Option", path: "/api/candidatos" },
          { label: "Rol", path: "/api/roles" },
          { label: "Customer", path: "/api/voto" },
          { label: "Result", path: "/api/reporte" },
          { label: "Admin Page", onClick: () => navigate("/Admin") },
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={() => btn.path ? fetchData(btn.path) : btn.onClick()}
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = "#00bfa5"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#00ffc3"}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Menú de búsqueda (antes desplegable) */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setMenuVisible(!menuVisible)}
          style={{
            ...buttonStyle,
            backgroundColor: "#333",
            color: "#00ffc3"
          }}
        >
          {menuVisible ? "Hide" : "Find"}
        </button>

        {menuVisible && (
          <div style={{ marginTop: "1.5rem" }}>
            {/* Buscar por email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={sectionTitle}>User</h4>
              <input
                type="email"
                placeholder="..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <button onClick={() => fetchData(`/api/usuarios/full${email}`)} style={buttonStyle}>Search</button>
              
            </div>

            {/* Buscar por hash */}
            <div>
              <h4 style={sectionTitle}>Find txHash</h4>
              <input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                style={inputStyle}
              />
              <button onClick={() => fetchData(`/api/voto/${txHash}`)} style={buttonStyle}>Search</button>
            </div>
          </div>
        )}
      </div>

      {/* Resultado */}
      <div>
        {loading ? (
          <p style={{ color: "#ccc" }}>🔄 Consultando base de datos...</p>
        ) : (
          resultado && (
            <pre style={{
              background: "#1e1e1e",
              color: "#00ffc3",
              padding: "1.5rem",
              borderRadius: "10px",
              maxHeight: "500px",
              overflow: "auto",
              whiteSpace: "pre-wrap"
            }}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          )
        )}
      </div>
    </div>
  );
};

export default Server;
