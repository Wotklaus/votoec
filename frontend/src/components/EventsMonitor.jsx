// src/components/EventsMonitorContent.jsx
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import styles from "../pages/styles/Eventscontroller.module.css";

// --- Importar íconos de Lucide React ---
import {
    UserPlus,       // Para Nuevos usuarios (UserCheck o UserPlus podrían funcionar bien)
    Vote,           // Para Votos emitidos (Vote es específico para votaciones)
    BarChart2,      // Para Recuento de votos (BarChart2 o PieChart)
    Monitor,        // (Ya lo tienes en Admin.jsx para el título general del monitor)
} from "lucide-react";
// ----------------------------------------

const socket = io(import.meta.env.VITE_BACKEND_URL);

const EventsMonitorContent = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [votos, setVotos] = useState([]);
    const [recuentos, setRecuentos] = useState([]);
    // 'lider' y su lógica ya fueron eliminados en la versión anterior.

    useEffect(() => {
        console.log("🟢 Conectado al WebSocket desde EventsMonitorContent");

        socket.on("nuevoUsuario", (data) => {
            console.log("👤 Evento nuevoUsuario recibido:", data);
            setUsuarios((prev) => [data, ...prev]);
        });

        socket.on("nuevoVoto", (data) => {
            console.log("🗳️ Evento nuevoVoto recibido:", data);
            setVotos((prev) => [data, ...prev]);
        });

        socket.on("recuentoActualizado", (data) => {
            console.log("📊 Evento recuentoActualizado recibido:", data);
            setRecuentos((prev) => [data, ...prev]);
        });

        return () => {
            socket.off("nuevoUsuario");
            socket.off("nuevoVoto");
            socket.off("recuentoActualizado");
        };
    }, []);

    return (
        <div className={styles.eventsDashboard}>
            {/* Título principal del monitor, usando un icono de Lucide React */}
            <h1>
                <Monitor size={24} className={styles.icon} /> {/* Tamaño un poco más grande para el título principal */}
                Monitor de Eventos
            </h1>

            <div className={styles.columnsContainer}>
                {/* Nuevos usuarios */}
                <section className={styles.sectionCard}>
                    <h2>
                        <UserPlus size={30} className={styles.icon} /> {/* Icono de Lucide React */}
                        Nuevos usuarios
                    </h2>
                    <ul className={styles.eventList}>
                        {usuarios.length > 0 ? (
                            usuarios.map((u, i) => (
                                <li key={i}>
                                    <strong>Email:</strong> {u.email} <br />
                                    <strong>Wallet:</strong> {u.wallet}
                                </li>
                            ))
                        ) : (
                            <li>Cargando..</li>
                        )}
                    </ul>
                </section>

                {/* Votos emitidos */}
                <section className={styles.sectionCard}>
                    <h2>
                        <Vote size={30} className={styles.icon} /> {/* Icono de Lucide React */}
                        Votos emitidos
                    </h2>
                    <ul className={styles.eventList}>
                        {votos.length > 0 ? (
                            votos.map((v, i) => (
                                <li key={i}>
                                    <strong>Votante:</strong> {v.votante} <br />
                                    <strong>Opción:</strong> {v.opcion} <br />
                                    <strong>TxHash:</strong> {v.txHash}
                                </li>
                            ))
                        ) : (
                            <li>Esperando...</li>
                        )}
                    </ul>
                </section>

                {/* Recuento de votos */}
                <section className={styles.sectionCard}>
                    <h2>
                        <BarChart2 size={30} className={styles.icon} /> {/* Icono de Lucide React */}
                        Recuento de votos
                    </h2>
                    <ul className={styles.eventList}>
                        {recuentos.length > 0 ? (
                            recuentos.map((r, i) => (
                                <li key={i}>
                                    <strong>Opción:</strong> {r.opcion} <br />
                                    <strong>Total votos:</strong> {r.totalVotos} <br />
                                    <strong>Porcentaje:</strong> {r.porcentaje}%
                                </li>
                            ))
                        ) : (
                            <li>Cargando...</li>
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default EventsMonitorContent;