
class votoDTO {
  constructor({ votante_email, votante_nombre, candidato_nombre, fecha, tx_hash }) {
    this.votanteEmail = votante_email;
    this.votanteNombre = votante_nombre; // nuevo campo
    this.candidatoNombre = candidato_nombre;
    this.fecha = fecha;
    this.txHash = tx_hash;
  }
}

module.exports = votoDTO;
