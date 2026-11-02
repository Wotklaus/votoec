const usuarioDAO = require("../dao/postgres/usuarioDAO");

class UsuarioService {
  async registrarUsuario(data) {
    return await usuarioDAO.insertar(data);
  }

  async listarUsuarios(filtro) {
    return await usuarioDAO.listar(filtro);
  }
}

module.exports = new UsuarioService();
