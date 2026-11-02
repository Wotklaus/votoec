import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import styles from "../pages/styles/VotingSection.module.css"; // ¡Importa el nuevo CSS Module!

const VotingSection = ({ userEmail, onVoteSuccess, onVoteError, onNavigateToProfile, onNavigateToResults }) => {
    const [candidatos, setCandidatos] = useState([]);
    const [votoSeleccionado, setVotoSeleccionado] = useState(null);
    const [mensajeInterno, setMensajeInterno] = useState(""); // Mensaje solo para el componente
    const [cargandoVoto, setCargandoVoto] = useState(false);
    const [votoEmitido, setVotoEmitido] = useState(false);

    const cargarCandidatos = useCallback(async () => {
        try {
            const respuesta = await api.get("/api/candidatos");
            const baseCandidatos = respuesta.data || [];

            const candidatosConImagen = baseCandidatos.map((candidato) => {
                let imagen = "/img/default.jpeg"; // Imagen por defecto

                if (candidato.id === 1) imagen = "/img/Candidato1.jpg";
                else if (candidato.id === 2) imagen = "/img/candidato2.jpg";
                else if (candidato.id === 3) imagen = "/img/canidato3.jpeg";

                return { ...candidato, imagen };
            });

            setCandidatos(candidatosConImagen);
        } catch (error) {
            console.error("Error al cargar candidatos:", error);
            setMensajeInterno("Error al cargar candidatos. Intenta de nuevo más tarde.");
        }
    }, []);

    useEffect(() => {
        cargarCandidatos();
        setVotoEmitido(false); // Resetear estado de voto al cargar el componente
        setMensajeInterno(""); // Resetear mensaje interno
        setVotoSeleccionado(null);
    }, [cargarCandidatos]);

    const votar = async (id) => {
        if (!userEmail) {
            setMensajeInterno("❌ No se encontró el email del usuario. Por favor inicia sesión.");
            if (onVoteError) onVoteError("No se encontró el email del usuario.");
            return;
        }

        setCargandoVoto(true);
        setMensajeInterno("");

        try {
            const respuesta = await api.post("/api/votar", {
                email: userEmail,
                opcion: id,
            });

            if (respuesta.data.success) {
                const { txHash } = respuesta.data;
                setVotoSeleccionado(id);
                const msg = `✅ Excelente. Hash de transacción: ${txHash}`;
                setMensajeInterno(msg);
                setVotoEmitido(true);
                if (onVoteSuccess) onVoteSuccess(msg); // Comunica al padre
            } else {
                const errorMsg = "❌ Error " + (respuesta.data.error || "desconocido");
                setMensajeInterno(errorMsg);
                if (onVoteError) onVoteError(errorMsg); // Comunica al padre
            }
        } catch (error) {
            console.error("Error enviando voto:", error);
            const errMsg = "❌ Usted ya registra un voto .";
            setMensajeInterno(errMsg);
            if (onVoteError) onVoteError(errMsg); // Comunica al padre
        } finally {
            setCargandoVoto(false);
        }
    };

    // La lógica para mostrar el botón "Volver al perfil" ahora se maneja en el padre
    // basado en `mensajeGlobal` de `Customer.jsx`. Aquí solo controlamos lo interno.

    return (
        <div className={styles.votingSectionContainer}>
            {cargandoVoto && <p className={styles.loading}>Procesando...</p>}

            {votoEmitido ? (
                <div className={styles.thankYouMessage}>
                    <h1>Gracias, {userEmail}!</h1>
                    <p className={`${styles.message} ${mensajeInterno.startsWith("✅") ? styles.success : styles.error}`}>
                        {mensajeInterno}
                    </p>
                    
                </div>
            ) : (
                <>
                    <h2>¿En qué área de la Facultad prefiere que se inviertan más recursos?</h2>

                    {mensajeInterno && (
                        <div className={`${styles.message} ${mensajeInterno.startsWith("✅") ? styles.success : styles.error}`}>
                            {mensajeInterno}
                            {mensajeInterno.includes("Ya votaste") && (
                                <div className={styles.navButtons}>
                                   
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.cardsContainer}>
                        {candidatos.map((op) => (
                            <div
                                key={op.id}
                                onClick={() => votar(op.id)}
                                className={`${styles.candidateCard} ${votoSeleccionado === op.id ? styles.selected : (votoEmitido ? styles.notSelected : '')}`}
                            >
                                <img
                                    src={op.imagen}
                                    alt={`Imagen de ${op.nombre}`}
                                    className={styles.candidateImage}
                                />
                                <h3>{op.nombre}</h3>
                                <p>{op.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default VotingSection;