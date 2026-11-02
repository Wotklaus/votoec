const userBCDAO = require("../dao/mongo/userBCDAO");

class UserBCService {
  async registrarUserBC(data) {
    return await userBCDAO.insertar(data);
  }

  async buscarPorEmail(email) {
    return await userBCDAO.buscarPorEmail(email);
  }
}

module.exports = new UserBCService();
