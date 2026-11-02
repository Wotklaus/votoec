const express = require("express");
const router = express.Router();
const votoReporteService = require("../services/votoReporte.service");

const service = new votoReporteService();

router.get("/", async (req, res) => {
  try {
    const reporte = await service.reporteConsolidado();
    res.json(reporte);
  } catch (error) {
    console.error("Error generando reporte consolidado:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

router.get("/reporte-votos-candidato", async (req, res) => {
  try {
    const reporte = await service.reportePorCandidato();
    res.json(reporte);
  } catch (error) {
    console.error("Error al generar reporte por candidato:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
