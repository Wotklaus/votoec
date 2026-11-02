class usuarioDTO {
  constructor({ id, email, nombre, apellido, cedula, telefono, contrasena, rol, activo }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.apellido = apellido;
    this.cedula = cedula;
    this.telefono = telefono;
    this.contrasena = contrasena; // nuevo campo agregado
    this.rol = rol; // string desde la vista JOIN con roles
    this.activo = activo;
  }
}

module.exports = usuarioDTO;
