const express = require("express");
const router = express.Router();
const UserBCDAO = require("../dao/mongo/userBCDAO"); // Mongo
const UsuarioDAO = require("../dao/postgres/usuarioDAO"); // PostgreSQL

const usuarioDAO = new UsuarioDAO;
const userBCDAO = new UserBCDAO;

// ✔ POST: Crear usuario (Mongo + PostgreSQL)
router.post("/crear", async (req, res) => {
  const { email, nombre, apellido, cedula, telefono, rol_id } = req.body;

  if (!email || !nombre || !apellido) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // PostgreSQL
    const nuevoId = await usuarioDAO.crear({ email, nombre, apellido, cedula, telefono, rol_id });
    
    // MongoDB
    const wallet = {
      address: "0x" + crypto.randomBytes(20).toString("hex"),
      privateKey: "0x" + crypto.randomBytes(32).toString("hex")
    };

    const mongoData = { email, wallet };
    await userBCDAO.crear(mongoData);

    res.status(201).json({ mensaje: "Usuario creado", id: nuevoId, wallet });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error interno al crear usuario" });
  }
});

//lista full 
router.get("/full", async (req, res) => {
  try {
    const mongoUsers = await userBCDAO.listar();
    const pgUsers = await usuarioDAO.listar_completo();

    res.json({ mongo: mongoUsers, postgres: pgUsers });
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener usuarios" });
  }
});

module.exports = router;