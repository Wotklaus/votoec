const hre = require("hardhat");

async function main() {
  const Voto = await hre.ethers.getContractFactory("VotoEC");
  const voto = await Voto.deploy();
  await voto.waitForDeployment();
  console.log("Contrato desplegado en:", voto.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
