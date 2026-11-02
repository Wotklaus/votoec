// src/models/notificacionModel.js
const mongoose = require("mongoose");

const notificacionSchema = new mongoose.Schema({
  email: String,
  asunto: String,
  mensaje: String,
  estado: String, // 'exitoso' o 'fallido'
  error: String,  // mensaje de error si falla
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notificacion", notificacionSchema);
