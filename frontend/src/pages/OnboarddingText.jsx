// src/pages/OnboardingText.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Onboarding.module.css'; // Crearemos este CSS

const OnboardingText = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login'); // Redirige a la ruta del login
    };

    const goToImagePanel = () => {
        navigate('/onboarding-image'); // Para ir al siguiente panel del "carrusel"
    };

    return (
        <div className={styles.onboardingContainer}>
            <div className={styles.onboardingCard}>
                <h2>Bienvenido a AdminPanel</h2>
                <p>
                    Esta plataforma te permite gestionar los datos y monitorear los eventos
                    clave de tu sistema de votación descentralizado.
                    Accede para visualizar resultados, administrar usuarios, wallets,
                    candidatos y roles.
                </p>
                <div className={styles.buttonGroup}>
                    <button className={styles.actionButton} onClick={goToLogin}>
                        Ir al Login
                    </button>
                    <button className={styles.navigateButton} onClick={goToImagePanel}>
                        Siguiente &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingText;