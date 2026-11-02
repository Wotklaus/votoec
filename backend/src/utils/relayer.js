require("dotenv").config();
const { ethers } = require("ethers");
const contratoJson = require("../VotoEC.json");
const abi = contratoJson.abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Verifica si un usuario ya votó
async function verificarVoto(address) {
    console.time("⏱️ Tiempo - verificarVoto");
    try {
        console.log("Dirección a verificar:", address);
        const yaVoto = await contract.verificarVoto(address);
        console.timeEnd("⏱️ Tiempo - verificarVoto");
        return yaVoto;
    } catch (err) {
        console.timeEnd("⏱️ Tiempo - verificarVoto");
        console.error("Error al verificar voto:", err);
        throw new Error("No se pudo verificar si el usuario ya votó");
    }
}

// Ejecuta el voto mediante meta-transacción
async function votarPorMetaTx(votante, opcion, firma) {
    console.log("→ Enviando a votarPorMetaTx con:");
    console.log("  votante:", votante);
    console.log("  opcion:", opcion);
    console.log("  firma:", firma);

    console.time("⏱️ Tiempo - votarPorMetaTx");
    try {
        console.log("Iniciando meta-transacción para votante:", votante);
        const tx = await contract.votarPorMetaTx(votante, opcion, firma);
        console.log("⛓️ Transacción enviada. Esperando confirmación...");

        // Espera a la confirmación en la blockchain (opcional pero útil)
        await tx.wait();

        console.log("✅ Transacción confirmada en blockchain:", tx.hash);
        console.timeEnd("⏱️ Tiempo - votarPorMetaTx");
        return tx;
    } catch (err) {
        console.timeEnd("⏱️ Tiempo - votarPorMetaTx");
        console.error("Error al votar con meta-tx:", err);
        throw new Error("No se puede emitir el voto por meta-transacción");
    }
}

module.exports = {
    verificarVoto,
    votarPorMetaTx
};
