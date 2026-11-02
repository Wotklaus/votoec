
class candidatoDTO {
    constructor({ id, nombre, descripcion, imagen_url,  activo }) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen_url = imagen_url;
        this.activo = activo;
    }
}

module.exports = candidatoDTO;