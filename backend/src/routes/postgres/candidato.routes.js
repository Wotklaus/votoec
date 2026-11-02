const express = require("express");
const router = express.Router();
const candidatoDAO = new (require("../../dao/postgres/candidatoDAO"))();

// ✔ GET: Listar todos los candidatos
router.get("/", async (req, res) => {
  try {
    const candidatos = await candidatoDAO.listar();
    res.status(200).json(candidatos);
  } catch (err) {
    console.error("Error al listar candidatos:", err);
    res.status(500).json({ error: "Error al listar candidatos" });
  }
});

// ✔ POST: Crear nuevo candidato
router.post("/", async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    await candidatoDAO.crear({ nombre, descripcion });
    res.status(201).json({ mensaje: "Candidato creado correctamente" });
  } catch (err) {
    console.error("Error al crear candidato:", err);
    res.status(500).json({ error: "Error al crear candidato" });
  }
});

// ✔ PUT: Actualizar candidato por ID
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  // Asegúrate de extraer imagen_url también si quieres que sea editable
  const { nombre, descripcion, imagen_url } = req.body; // <--- MODIFICADO AQUÍ

  try {
    // Pasa imagen_url al DAO
    await candidatoDAO.actualizar(id, { nombre, descripcion, imagen_url }); // <--- MODIFICADO AQUÍ
    res.status(200).json({ mensaje: "Candidato actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar candidato:", err);
    res.status(500).json({ error: "Error al actualizar candidato" });
  }
});


// ✔ DELETE: Desactivar candidato
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id); // Asegurarse de que es un número para el ID

  try {
    // Llamamos al método 'eliminar' del DAO, que a su vez llama a tu función DB 'eliminar_candidato'
    await candidatoDAO.eliminar(id);
    res.status(200).json({ mensaje: `✅ Candidato con ID ${id} eliminado físicamente.` });
  } catch (error) {
    console.error("❌ Error al eliminar candidato físicamente:", error);
    // Es posible que el error 500 persista si hay restricciones de clave foránea en tu DB
    res.status(500).json({ error: "Error al eliminar el candidato físicamente. Verifique dependencias." });
  }
});

router.delete("/eliminar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("SELECT eliminar_candidato($1)", [id]);
    res.json({ mensaje: `✅ Candidato con ID ${id} eliminado.` });
  } catch (error) {
    console.error("❌ Error al eliminar candidato:", error);
    res.status(500).json({ error: "Error al eliminar el candidato." });
  }
});

module.exports = router;
