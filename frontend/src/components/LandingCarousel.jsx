// src/components/SplashScreen.jsx (o LandingCarousel.jsx)
import React, { useState, useEffect } from 'react';
import styles from '../pages/styles/LandingCarousel.module.css'; // Nuevo CSS para esta vista
import { ArrowLeft, ArrowRight } from 'lucide-react'; // Necesitas lucide-react instalado

// Importa tu componente de Login real (sin las envolturas de página)
import Login from '../pages/Login'; // Asegúrate de que esta ruta sea correcta

const SplashScreen = ({ onLoginSuccess }) => {
    const [currentPanel, setCurrentPanel] = useState(0); // 0: Login, 1: Texto, 2: Imagen
    const totalPanels = 3; // Número total de paneles

    // Lógica para el deslizamiento automático (opcional, pero mejora la experiencia)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPanel((prev) => (prev + 1) % totalPanels);
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, []);

    const goToNextPanel = () => {
        setCurrentPanel((prev) => (prev + 1) % totalPanels);
    };

    const goToPrevPanel = () => {
        setCurrentPanel((prev) => (prev - 1 + totalPanels) % totalPanels);
    };

    const handleLoginCompleted = () => {
        // Cuando el Login dentro de este componente es exitoso,
        // llama a la función pasada por App.jsx
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    };

    return (
        <div className={styles.splashContainer}>
            <div
                className={styles.carouselInner}
                style={{ transform: `translateX(-${currentPanel * (100 / totalPanels)}%)` }}
            >
                {/* Panel 1: Login */}
                <div className={styles.carouselPanel}>
                    <div className={styles.panelContent}>
                        {/* Renderiza tu componente de Login aquí */}
                        <Login onLoginSuccess={handleLoginCompleted} />
                    </div>
                </div>

                {/* Panel 2: Texto */}
                <div className={styles.carouselPanel}>
                    <div className={styles.panelContent}>
                        <h2>Bienvenido a AdminPanel</h2>
                        <p>
                            Esta plataforma te permite gestionar los datos y monitorear los eventos
                            clave de tu sistema de votación descentralizado.
                            Accede para visualizar resultados, administrar usuarios, wallets,
                            candidatos y roles.
                        </p>
                        {/* Puedes poner un botón para ir directamente al login si quieres, o solo las flechas */}
                        <button className={styles.actionButton} onClick={() => setCurrentPanel(0)}>
                            Ir al Login
                        </button>
                    </div>
                </div>

                {/* Panel 3: Imagen */}
                <div className={styles.carouselPanel}>
                    <div className={styles.panelContent}>
                        <img
                            src="https://via.placeholder.com/600x400/29393d/FFFFFF?text=Tu+Imagen+Aqui" // Reemplaza con tu imagen
                            alt="Sistema de votación descentralizado"
                            className={styles.carouselImage}
                        />
                        <h2>Visión General</h2>
                        <p>
                            Explora una interfaz intuitiva diseñada para un control total.
                        </p>
                        {/* Puedes poner un botón para ir directamente al login si quieres, o solo las flechas */}
                        <button className={styles.actionButton} onClick={() => setCurrentPanel(0)}>
                            Ir al Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Controles de navegación manual (flechas) */}
            <button className={`${styles.navButton} ${styles.prev}`} onClick={goToPrevPanel}>
                <ArrowLeft size={32} />
            </button>
            <button className={`${styles.navButton} ${styles.next}`} onClick={goToNextPanel}>
                <ArrowRight size={32} />
            </button>

            {/* Indicadores de panel (dots) */}
            <div className={styles.dotsContainer}>
                {Array.from({ length: totalPanels }).map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${currentPanel === index ? styles.activeDot : ''}`}
                        onClick={() => setCurrentPanel(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SplashScreen;