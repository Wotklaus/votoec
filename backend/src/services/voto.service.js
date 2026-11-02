const relayer = require("./relayer.service");
const userBCDAO = getDAOFactory("mongo").getUserBCDAO();
const usuarioDAO = getDAOFactory("postgres").getUsuarioDAO();
const votoDAO = getDAOFactory("postgres").getVotoDAO();

async function emitirVoto({ email, opcion }) {
  const usuario = await userBCDAO.buscarPorEmail(email);
  if (!usuario || !usuario.wallet) throw new Error("Wallet no encontrada");

  const firma = await relayer.firmarMensaje(usuario.wallet.privateKey, usuario.wallet.address);
  const resultado = await relayer.emitirVoto(opcion, firma, usuario.wallet.address);

  const usuarioPG = await usuarioDAO.buscarPorEmail(email);
  if (!usuarioPG) throw new Error("Usuario no registrado en PostgreSQL");

  await votoDAO.registrar({
    votanteId: usuarioPG.id,
    candidatoId: opcion,
    txHash: resultado.txHash
  });

  await userBCDAO.agregarAuditoria(email, {
    accion: "voto",
    fecha: new Date(),
    txHash: resultado.txHash
  });

  return {
    txHash: resultado.txHash,
    wallet: usuario.wallet.address
  };
}

module.exports = { emitirVoto };
