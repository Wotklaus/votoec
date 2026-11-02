const { expect } = require("chai");

describe("VotoEC", function () {
  it("debe permitir votar una vez y contar votos", async function () {
    const Voto = await ethers.getContractFactory("VotoEC");
    const voto = await Voto.deploy();
    const [user1, user2] = await ethers.getSigners();

    await voto.connect(user1).votar(1);
    await voto.connect(user2).votar(2);

    expect(await voto.obtenerVotos(1)).to.equal(1);
    expect(await voto.obtenerVotos(2)).to.equal(1);
  });
});
