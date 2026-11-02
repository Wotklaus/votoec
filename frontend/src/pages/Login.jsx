// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import api from "../api";

function Login() {
    const [credenciales, setCredenciales] = useState({ email: "", contrasena: "" });
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();

    const manejarLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje("");

        try {
            const respuesta = await api.post("/api/login", credenciales);
            // Asegúrate de que tu backend devuelve 'usuario' y dentro de 'usuario' estén 'rol_id', 'email', 'nombre'
            // Y que también devuelva un 'token' directamente en respuesta.data si no está dentro de 'usuario'
            const { usuario, token } = respuesta.data; // <--- Asumo que 'token' también viene en respuesta.data

            console.log("LOGIN EXITOSO - Usuario:", usuario);
            console.log("LOGIN EXITOSO - ROL RECIBIDO:", usuario.rol_id);
            console.log("LOGIN EXITOSO - TOKEN RECIBIDO:", token ? "Existente" : "No existente");


            // ***** CORRECCIÓN CRÍTICA AQUÍ: USA 'rol_id' Y GUARDA EL TOKEN *****
            localStorage.setItem("email", usuario.email);
            localStorage.setItem("rol_id", usuario.rol_id.toString()); // Asegúrate de que rol_id se guarde como string
            localStorage.setItem("token", token); // <--- Guarda el token aquí

            setMensaje(`✅ Bienvenido, ${usuario.nombre} (rol: ${usuario.rol_id})`);

            // Redirección por rol (siempre usa el ID numérico para comparar)
            if (usuario.rol_id === 1) { // Si el rol es el ID numérico 1
                navigate("/admin");
            } else if (usuario.rol_id === 2) { // Si el rol es el ID numérico 2
                navigate("/customer");
            } else {
                navigate("/home"); // fallback (quizás una página genérica de usuario o acceso denegado)
            }

        } catch (error) {
            console.error("Error en login:", error.response?.data?.error || error.message || "Error inesperado.");
            setMensaje(error.response?.data?.error || "❌ Error en el inicio de sesión. Credenciales incorrectas o problema de servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Iniciar Sesión</h2>

                <form onSubmit={manejarLogin}>
                    <div className="login-input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={credenciales.email}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>
                    <div className="login-input-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={credenciales.contrasena}
                            onChange={handleChange}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" disabled={cargando}>
                        {cargando ? "Ingresando..." : "Iniciar Sesión"}
                    </button>
                </form>

                {mensaje && (
                    <div
                        className="login-message"
                        style={{ color: mensaje.includes("✅") ? "green" : "red" }}
                    >
                        {mensaje}
                    </div>
                )}

                <div className="login-links">
                    <p>
                        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
                    </p>
                    <p>
                        ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;