const Notificacion = require("../models/notificacionModel");

async function guardarNotificacion({ email, tipo, asunto, mensaje, estado = "exitoso", error = null }) {
  try {
    const notificacion = new Notificacion({
      email,
      tipo,
      asunto,
      mensaje,
      estado,
      error,
    });
    await notificacion.save();
    console.log(`✅ Notificación guardada para ${email} - tipo: ${tipo}`);
  } catch (err) {
    console.error("❌ Error guardando notificación:", err);
  }
}

module.exports = { guardarNotificacion };
