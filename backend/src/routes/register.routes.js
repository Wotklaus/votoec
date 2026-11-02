const express = require("express");
const { Wallet, ethers } = require("ethers");
const bcrypt = require("bcrypt");
const router = express.Router();

const UsuarioDAO = require("../dao/postgres/usuarioDAO");
const UserBCDAO = require("../dao/mongo/userBCDAO");
const contratoJson = require("../VotoEC.json"); // <- ABI del contrato

const usuarioDAO = new UsuarioDAO();
const userBCDAO = new UserBCDAO();

// Validar Email
const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/registro
router.post("/", async (req, res) => {
  const { email, nombre, apellido, cedula, telefono, contrasena, rol_id } = req.body;

  if (!email || !nombre || !apellido || !cedula || !telefono || !contrasena || !rol_id) {
    return res.status(400).json({ success: false, error: "Todos los campos son obligatorios" });
  }

  if (!esEmailValido(email)) {
    return res.status(400).json({ success: false, error: "Correo con formato inválido" });
  }

  try {
    const existente = await userBCDAO.buscarPorEmail(email);
    if (existente) {
      return res.status(400).json({ success: false, error: "Correo ya registrado" });
    }

    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    const saltRounds = 10;
    const hashContrasena = await bcrypt.hash(contrasena, saltRounds);

    // Guardar en PostgreSQL
    const usuarioPG = {
      email, nombre, apellido, cedula, telefono,
      contrasena: hashContrasena,
      rol_id: 2
    };

    const resultado = await usuarioDAO.crear(usuarioPG);
    const votanteId = resultado.id;

    // Guardar en MongoDB
    const userMongo = {
      email,
      wallet: { address, privateKey },
      auditoria: [{ accion: "transacción", fecha: new Date() }]
    };
    await userBCDAO.crear(userMongo);

    // EMITIR EVENTO USUARIOREGISTRADO EN BLOCKCHAIN ✅
    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, contratoJson.abi, signer);

      const tx = await contrato.registrarUsuario(address, email);
      await tx.wait();

      console.log(`✅ Evento UsuarioRegistrado emitido para ${email}`);
    } catch (error) {
      console.error("❌ Error al emitir evento UsuarioRegistrado:", error.message);
    }

    // Respuesta
    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      votanteId,
      wallet: address
    });

  } catch (error) {
    console.error("❌ Error en el registro:", error);
    res.status(500).json({
      success: false,
      error: "Error en el servidor al registrar el usuario"
    });
  }
});

module.exports = router;
