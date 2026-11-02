const pool = require("../../config/postgres");
const candidatoDTO = require("../../dto/postgres/candidatoDTO");

class candidatoDAO {
  async crear({ nombre, descripcion, imagen_url}) {
    await pool.query("SELECT nuevo_candidato($1, $2, $3)", [nombre, descripcion, imagen_url]);
  }

  async listar() {
    const result = await pool.query("SELECT * FROM ver_candidatos()");
    return result.rows.map(row => new candidatoDTO(row));
  } 

  async actualizar(id, { nombre, descripcion, imagen_url }) {
    await pool.query("SELECT actualizar_candidato($1, $2, $3, $4)", [id, nombre, descripcion, imagen_url]);
  }
  
  async desactivar(id) {
    await pool.query("SELECT desactivar_candidato($1)", [id]);
  }
  async eliminar(id) {
    // Llamamos a tu función de base de datos 'eliminar_candidato'
    await pool.query("SELECT eliminar_candidato($1)", [id]);
  }
}

module.exports = candidatoDAO;