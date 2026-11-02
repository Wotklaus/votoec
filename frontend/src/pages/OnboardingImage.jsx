// src/pages/OnboardingImage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Onboarding.module.css'; // Usaremos el mismo CSS

const OnboardingImage = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login'); // Redirige a la ruta del login
    };

    const goToTextPanel = () => {
        navigate('/onboarding-text'); // Para ir al panel de texto anterior
    };

    return (
        <div className={styles.onboardingContainer}>
            <div className={styles.onboardingCard}>
                <img
                    src="https://via.placeholder.com/600x400/29393d/FFFFFF?text=Tu+Imagen+Aqui" // Reemplaza con la ruta a tu imagen real
                    alt="Sistema de votación descentralizado"
                    className={styles.onboardingImage}
                />
                <h2>Visión General</h2>
                <p>
                    Explora una interfaz intuitiva diseñada para un control total.
                </p>
                <div className={styles.buttonGroup}>
                    <button className={styles.navigateButton} onClick={goToTextPanel}>
                        &larr; Anterior
                    </button>
                    <button className={styles.actionButton} onClick={goToLogin}>
                        Ir al Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingImage;