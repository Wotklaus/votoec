const pool = require("../../config/postgres");
const votoDTO = require("../../dto/postgres/votoDTO");
const votosPorCandidatoDTO = require("../../dto/postgres/votosPorCandidatoDTO");


class votoDAO {

  // Registrar voto (off-chain replica del on-chain)
  async registrar({ usuarioId, candidatoId, txHash }) {
    await pool.query("SELECT registrar_voto($1, $2, $3)", [
      usuarioId,
      candidatoId,
      txHash,
    ]);
  }

  async listar() {
    const result = await pool.query("SELECT * FROM ver_votos()");
    return result.rows.map((row) => new votoDTO(row));
  }

  async reportePorCandidato() {
    const result = await pool.query("SELECT * FROM ver_reporte_votos_por_candidato()");
    return result.rows.map(row => new votosPorCandidatoDTO({
      id: row.id,
      nombre: row.nombre,
      totalVotos: parseInt(row.total_votos, 10),
    }));
  }

  // Buscar por hash de transacción
  async obtenerPorTxHash(txHash) {
    const result = await pool.query("SELECT * FROM ver_voto_por_hash($1)", [txHash]);
    return result.rows.length > 0 ? new votoDTO(result.rows[0]) : null;
  }
}

module.exports = votoDAO;
