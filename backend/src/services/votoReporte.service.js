const UserBCDAO = require("../dao/mongo/userBCDAO");
const VotoDAO = require("../dao/postgres/votoDAO");
const ReportetDTO = require("../dto/reporteDTO");

const votoDAO = new VotoDAO();
const userBCDAO = new UserBCDAO();

class votoReporteService {
  async reporteConsolidado() {
    const votos = await votoDAO.listar();
    const emails = [...new Set(votos.map(v => v?.votanteEmail).filter(Boolean))];
    const walletsMap = await userBCDAO.obtenerWalletsPorEmails(emails);

    return votos
      .filter(v => v) // evita undefined/null
      .map(voto => new ReportetDTO({
        votanteEmail: voto.votanteEmail,
        votanteNombre: voto.votanteNombre,
        walletAddress: walletsMap[voto.votanteEmail] || null,
        txHash: voto.txHash,
        fecha: voto.fecha,
        candidatoNombre: voto.candidatoNombre
      }));
  }

  async reportePorCandidato() {
    return await votoDAO.reportePorCandidato();
  }
}

module.exports = votoReporteService;
