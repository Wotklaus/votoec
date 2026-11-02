class reportetDTO {
  constructor({ votanteEmail, votanteNombre, walletAddress, txHash, fecha, candidatoNombre  }) {
    this.votanteEmail = votanteEmail;
    this.votanteNombre = votanteNombre; 
    this.walletAddress = walletAddress;
    this.txHash = txHash;
    this.fecha = fecha;
    this.candidatoNombre = candidatoNombre;
    
  }
}

module.exports = reportetDTO;
