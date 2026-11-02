const express = require("express");
const router = express.Router();
const RolDAO = require("../../dao/postgres/rolDAO");
const rolDAO = new RolDAO;

// crear rol
router.post("/", async (req, res) => {
  try {
    await rolDAO.crear(req.body.nombre);
    res.status(201).json({ mensaje: "Rol creado" });
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error interno" });
  }
});


// todos los roles
router.get("/", async (req, res) => {
  try {
    const roles = await rolDAO.listar();
    res.json(roles);
  } catch (error) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ error: "Error interno" });
  }
});


// GET por ID
router.get("/:id", async (req, res) => {
  try {
    const rol = await rolDAO.obtenerPorId(parseInt(req.params.id));
    if (!rol) return res.status(404).json({ error: "Rol no encontrado" });
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
});


// PUT actualizar
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
  }

  try {
    await rolDAO.actualizar(id, nombre);
    res.status(200).json({ mensaje: "Rol actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error interno" });
  }
});



//  DELETE eliminar
router.delete("/:id", async (req, res) => {
  try {
    await rolDAO.eliminar(parseInt(req.params.id));
    res.status(200).json({ mensaje: "Rol eliminado" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;



