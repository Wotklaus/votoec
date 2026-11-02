const pool = require("../../config/postgres");
const rolDTO = require("../../dto/postgres/rolDTO");

class rolDAO {
  
  // Crear nuevo rol
  async crear(nombre) {
    const query = `SELECT nuevo_rol($1)`;
    await pool.query(query, [nombre]);
  }

  // Listar todos los roles
  async listar() {
    const query = `SELECT * FROM listar_roles()`;
    const result = await pool.query(query);
    return result.rows.map(row => new rolDTO(row));
  }

  // Obtener rol por ID
  async obtenerPorId(id) {
    const query = `SELECT * FROM ver_rol_por_id($1)`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new rolDTO(result.rows[0]) : null;
  }

  // Actualizar nombre de rol
  async actualizar(id, nombre) {
    const query = `SELECT actualizar_rol($1, $2)`;
    await pool.query(query, [id, nombre]);
  }

  // Eliminar (desactivar) rol
  async eliminar(id) {
    const query = `SELECT eliminar_rol($1)`;
    await pool.query(query, [id]);
  }
}

module.exports = rolDAO;
