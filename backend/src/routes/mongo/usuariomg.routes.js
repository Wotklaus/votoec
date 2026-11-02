// src/routes/mongo/usuarios.mongo.routes.js
const express = require("express");
const router = express.Router();
const UserBCDAO = require("../../dao/mongo/userBCDAO");
const userBCDAO = new UserBCDAO();


// lista mongo
router.get("/", async (req, res) => {
  const usuarios = await userBCDAO.listar();
  res.json(usuarios);
});

// GET: Buscar usuario por email
router.get("/:email", async (req, res) => {
  try {
    const user = await userBCDAO.buscarPorEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error("Mongo GET Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// PUT: Actualizar usuario
router.put("/:email", async (req, res) => {
  try {
    await userBCDAO.registrarVoto(req.params.email, req.body);
    res.json({ mensaje: "Usuario actualizado" });
  } catch (error) {
    console.error("Mongo PUT Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// DELETE: Eliminar usuario
router.delete("/:email", async (req, res) => {
  try {
    const eliminado = await userBCDAO.eliminar(req.params.email);
    if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error("Mongo DELETE Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
