const express = require("express");
const router = express.Router();
const VotoDAO = require("../../dao/postgres/votoDAO");  // Asumo que tienes un método para crear este DAO
const votoDAO = new VotoDAO;


// Listar todos los votos
router.get("/", async (req, res) => {
  try {
    const votos = await votoDAO.listar();
    res.json(votos);
  } catch (error) {
    console.error("Error al listar votos:", error);
    res.status(500).json({ error: "Error interno al listar votos" });
  }
});

// Obtener voto por txHash
router.get("/:txHash", async (req, res) => {
  const txHash = req.params.txHash;
  try {
    const voto = await votoDAO.obtenerPorTxHash(txHash);
    if (!voto) {
      return res.status(404).json({ error: "Voto no encontrado" });
    }
    res.json(voto);
  } catch (error) {
    console.error("Error al buscar voto por txHash:", error);
    res.status(500).json({ error: "Error interno al buscar voto" });
  }
});

module.exports = router;
