import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Registro.css";
import api from "../api";

function Registro() {
  const [formulario, setFormulario] = useState({
    email: "",
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    contrasena: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const datosConRol = { ...formulario, rol_id: 2 };
      await api.post("/api/registro", datosConRol);

      setMensaje("✅ Registro exitoso");

      setFormulario({
        email: "",
        nombre: "",
        apellido: "",
        cedula: "",
        telefono: "",
        contrasena: "",
      });
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje(
        error.response?.data?.error
          ? "⚠️ " + error.response.data.error
          : "❌ Error inesperado."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <h2>Registro de Usuario</h2>

        <form onSubmit={manejarRegistro}>
          {[
            { label: "Email", name: "email", type: "email" },
            { label: "Nombre", name: "nombre" },
            { label: "Apellido", name: "apellido" },
            { label: "Cédula", name: "cedula" },
            { label: "Teléfono", name: "telefono" },
            { label: "Contraseña", name: "contrasena", type: "password" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name} className="registro-input-group">
              <label>{label}</label>
              <input
                type={type}
                name={name}
                value={formulario[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {mensaje && (
          <div
            className="registro-mensaje"
            style={{ color: mensaje.includes("✅") ? "green" : "red" }}
          >
            {mensaje}
          </div>
        )}

        <div className="registro-volver">
          <button className="volver-btn" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registro;
