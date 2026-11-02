import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Blockchain.css";
import api from "../api";

function BlockchainSim() {
    const [bloques, setBloques] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function cargarVotos() {
            try {
                // Asegúrate de que tu API /api/reporte devuelve el campo 'votanteEmail'
                const res = await api.get("/api/reporte");
                setBloques(res.data || []);
            } catch (error) {
                console.error("Error al cargar la cadena:", error);
            }
        }

        cargarVotos();
    }, []);

    const volverAlPerfil = () => {
        const rol = localStorage.getItem("rol_id");

        if (rol === "1") {
            navigate("/admin");
        } else if (rol === "2") {
            navigate("/customer");
        } else {
            navigate("/"); // ruta por defecto si no hay rol válido
        }
    };

    return (
        <div className="blockchain-container">
            <h2 className="blockchain-title">Cadena de Bloques</h2>

            <div className="block-grid">
                {bloques.map((bloque, index) => (
                    <div className="block-card" key={index}>
                        <h4 className="block-header">🧱 Bloque #{index + 1}</h4>
                        {/* Aquí mostramos el nombre del votante */}
                        <p><strong>Votante:</strong><br />{bloque.votanteNombre}</p>
                        {/* AQUÍ AÑADIMOS EL CORREO DEL VOTANTE */}
                        {bloque.votanteEmail && <p><strong>Email:</strong><br />{bloque.votanteEmail}</p>}
                        
                        <p><strong>Candidato:</strong><br />{bloque.candidatoNombre}</p>
                        <p className="block-wallet"><strong>Wallet:</strong><br />{bloque.walletAddress}</p>
                        <p className="block-hash"><strong>TxHash:</strong><br />{bloque.txHash.slice(0, 12)}...</p>
                    </div>
                ))}
            </div>

            {/* Botón de regreso */}
            <div style={{ marginTop: "2rem" }}>
                <button onClick={() => navigate("/admin")}>
                    ← Volver al perfil
                </button>
            </div>
        </div>
    );
}

export default BlockchainSim;