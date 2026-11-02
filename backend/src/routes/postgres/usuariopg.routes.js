// src/routes/postgres/usuarios.pg.routes.js
const express = require("express");
const router = express.Router();
const UsuarioDAO = require("../../dao/postgres/usuarioDAO");
const usuarioDAO = new UsuarioDAO();


// lista PG
router.get("/", async (req, res) => {
  const usuarios = await usuarioDAO.listar_completo();
  res.json(usuarios);
});

// GET: Buscar usuario por email
router.get("/:email", async (req, res) => {
  try {
    const user = await usuarioDAO.buscarPorEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error("PostgreSQL GET Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// PUT: Actualizar usuario
router.put("/:email", async (req, res) => {
  const email = req.params.email;
  // req.body contendrá solo { nombre, apellido, cedula, telefono } desde el frontend
  const nuevosDatosPerfil = req.body;

  try {
    // Llama al nuevo método que usa el procedimiento almacenado específico para el perfil
    await usuarioDAO.actualizarPerfil(email, nuevosDatosPerfil);
    res.status(200).json({ mensaje: "Perfil de usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error);
    res.status(500).json({ error: "Error interno al actualizar perfil de usuario" });
  }
});


// DELETE: Eliminar usuario
router.delete("/:email", async (req, res) => {
  const email = req.params.email;

  try {
    await usuarioDAO.desactivar(email);
    res.status(200).json({ mensaje: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({ error: "Error interno al desactivar usuario" });
  }
});


module.exports = router;
