const express = require("express");
const router = express.Router();
const relayerService = require("../services/relayer.service");
const UserBCDAO = require("../dao/mongo/userBCDAO");
// const UsuarioDAO = require("../dao/postgres/usuarioDAO"); // <-- Eliminar o comentar
// const VotoDAO = require("../dao/postgres/votoDAO");     // <-- Eliminar o comentar

// const usuarioDAO = new UsuarioDAO; // <-- Eliminar o comentar
const userBCDAO = new UserBCDAO;
// const votoDAO = new VotoDAO;       // <-- Eliminar o comentar

router.post("/", async (req, res) => {
  const { email, opcion } = req.body;

  if (!email || !opcion) {
    console.log("Email u opción faltantes:", { email, opcion });
    return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
  }

  console.time("🕒 TOTAL - /votar");

  try {
    console.time("🕒 buscar usuario MongoDB");
    const usuarioMongo = await userBCDAO.buscarPorEmail(email);
    console.timeEnd("🕒 buscar usuario MongoDB");

    if (!usuarioMongo || !usuarioMongo.wallet?.privateKey) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado o sin wallet",
      });
    }

    const { privateKey, address } = usuarioMongo.wallet;

    console.time("🕒 firmar mensaje");
    const firma = await relayerService.firmarMensaje(privateKey, address);
    console.timeEnd("🕒 firmar mensaje");

    console.time("🕒 votar por metaTx (relayer)");
    const resultado = await relayerService.votar(opcion, firma, address);
    console.timeEnd("🕒 votar por metaTx (relayer)");

    const { txHash } = resultado;

    // --- CÓDIGO A ELIMINAR O COMENTAR ---
    // console.time("🕒 buscar usuario PostgreSQL");
    // const usuarioPG = await usuarioDAO.buscarPorEmail(email);
    // console.timeEnd("🕒 buscar usuario PostgreSQL");

    // if (!usuarioPG?.id) {
    //   return res.status(404).json({
    //     success: false,
    //     error: "Usuario no encontrado en PostgreSQL",
    //   });
    // }

    // console.time("🕒 guardar voto en PostgreSQL");
    // await votoDAO.registrar({
    //   usuarioId: usuarioPG.id,
    //   candidatoId: opcion,
    //   txHash
    // });
    // console.timeEnd("🕒 guardar voto en PostgreSQL");

    // const datosActualizados = {
    //   voto: { opcion, fecha: new Date(), firma },
    //   txHash
    // };

    // console.time("🕒 actualizar MongoDB");
    // await userBCDAO.registrarVoto(email, datosActualizados);
    // console.timeEnd("🕒 actualizar MongoDB");
    // --- FIN CÓDIGO A ELIMINAR O COMENTAR ---

    // Puedes dejar una actualización básica en MongoDB si lo deseas, pero el "voto definitivo"
    // y la actualización completa deberían venir del listener.
    // Por ejemplo, para marcar que el voto está "pendiente" o "enviado".
    // await userBCDAO.marcarVotoEnviado(email, { opcion, txHash }); // <-- Si necesitas un estado intermedio

    console.timeEnd("🕒 TOTAL - /votar");

    res.status(200).json({
      success: true,
      mensaje: "Voto enviado a la blockchain para procesamiento", // Mensaje más preciso
      wallet: address,
      txHash
    });

  } catch (err) {
    console.timeEnd("🕒 TOTAL - /votar");
    console.error("❌ Error al votar:", err);
    res.status(500).json({
      success: false,
      error: "Error en el servidor al procesar el voto"
    });
  }
});

module.exports = router;