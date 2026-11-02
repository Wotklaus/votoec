const pool = require("../../config/postgres");
const usuarioDTO = require("../../dto/postgres/usuarioDTO");

class usuarioDAO {
  // Método crear con campo contrasena
  async crear({ email, nombre, apellido, cedula, telefono, contrasena, rol_id }) {
    const resultado = await pool.query(
      "SELECT nuevo_usuario($1, $2, $3, $4, $5, $6, $7)", 
      [email, nombre, apellido, cedula, telefono, contrasena, rol_id]
    );
    return { id: resultado.rows[0].nuevo_usuario };
  }

  async buscarPorEmail(email) {
    const res = await pool.query("SELECT * FROM buscar_usuario_email($1)", [email]);
    if (res.rows.length === 0) return null;
    return new usuarioDTO(res.rows[0]);
  }

  async listar_completo() {
    const result = await pool.query("SELECT * FROM listar_usuarios();");
    return result.rows;
  }

  async listar(filtro = "") {
    const res = await pool.query("SELECT * FROM ver_usuarios($1)", [filtro]);
    return res.rows.map(row => new usuarioDTO(row));
  }

  // Actualizar también debe incluir contrasena
  async actualizar(email, datos) {
    const { nombre, apellido, cedula, telefono, contrasena, rol_id } = datos;
    await pool.query(
      "SELECT actualizar_usuario($1, $2, $3, $4, $5, $6, $7)",
      [email, nombre, apellido, cedula, telefono, contrasena, rol_id]
    );
  }

  async actualizarPerfil(email, nuevosDatosPerfil) {
    const { nombre, apellido, cedula, telefono } = nuevosDatosPerfil;
    // Llama a la nueva función de PostgreSQL que solo actualiza el perfil
    await pool.query(
      "SELECT actualizar_usuario($1, $2, $3, $4, $5)",
      [email, nombre, apellido, cedula, telefono]
    );
  }

  async desactivar(id) {
    await pool.query("SELECT desactivar_usuario_por_email($1)", [id]);
  }
}

module.exports = usuarioDAO;
