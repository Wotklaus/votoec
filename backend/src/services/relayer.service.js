const contrato = require("../utils/relayer");
const { ethers, solidityPackedKeccak256, getBytes } = require("ethers");


/**
 * Firma un mensaje en base al hash del address (como espera el contrato).
 * @param {string} privateKey - Clave privada del usuario
 * @param {string} address - Dirección pública del usuario
 * @returns {string} Firma digital (hex)
 */

async function firmarMensaje(privateKey, address) {
    const wallet = new ethers.Wallet(privateKey);
    const hash = solidityPackedKeccak256(["address"], [address]);
    const firma = await wallet.signMessage(ethers.getBytes(hash));
    return firma;
}


/**
 * Ejecuta el voto vía meta-transacción en el contrato.
 * @param {number} opcion - opción de voto (ej: 1, 2)
 * @param {string} firma - firma generada
 * @param {string} address - dirección del votante
 * @returns { txHash, votante }
 */

async function votar(opcion, firma, address) {
    const yaVoto = await contrato.verificarVoto(address);
    if (yaVoto) throw new Error("Ya votaste");

    const tx = await contrato.votarPorMetaTx(address, opcion, firma);
    await tx.wait();

    return {
        txHash: tx.hash,
        votante: address
    };
}

module.exports = {
    firmarMensaje,
    votar
};

