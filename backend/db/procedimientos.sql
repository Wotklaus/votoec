-- =============================================
-- Procedimientos Almacenados - Sistema VotoEC
-- Base de datos: votoec
-- =============================================
-- psql -U postgres -d votoec -f backend/db/procedimientos.sql



-- =============================================
--                  LOGIN
-- =============================================
CREATE OR REPLACE FUNCTION login_usuario(_email TEXT)
RETURNS TABLE(
  id INTEGER,
  email TEXT,
  contrasena TEXT,
  nombre TEXT,
  rol_id INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.email::TEXT, 
    u.contrasena::TEXT,
    u.nombre::TEXT,   -- casteo añadido aquí
    u.rol_id
  FROM usuarios u
  WHERE u.email = _email AND u.activo = TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--                 ENTIDAD ROLES
-- =============================================

--    Crear nuevo rol
CREATE OR REPLACE FUNCTION nuevo_rol(_nombre TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO roles (nombre) VALUES (_nombre);
END;
$$ LANGUAGE plpgsql;

-- =============================================
---   Listar roles
CREATE OR REPLACE FUNCTION listar_roles()
RETURNS TABLE(
  id INT,
  nombre VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.nombre
  FROM roles r;
END;
$$ LANGUAGE plpgsql;

-- =============================================
---   Actualizar un rol 
CREATE OR REPLACE FUNCTION actualizar_rol(_id INT, _nombre TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE roles SET nombre = _nombre WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
---   Eliminar un rol
CREATE OR REPLACE FUNCTION eliminar_rol(_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM roles WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--                ENTIDAD USUARIO
-- =============================================

--Insertar nuevo usuario
CREATE OR REPLACE FUNCTION nuevo_usuario(
  _email VARCHAR(255),
  _nombre VARCHAR(100),
  _apellido VARCHAR(100),
  _cedula VARCHAR(20),
  _telefono VARCHAR(20),
  _contrasena VARCHAR(255),
  _rol_id INT DEFAULT 2 -- 1=admin, 2=votante
)
RETURNS INTEGER AS $$
DECLARE
  nuevo_id INTEGER;
BEGIN
  -- Validar existencia previa
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = _email) THEN
    RAISE EXCEPTION 'El email % ya está registrado', _email;
  END IF;

  INSERT INTO usuarios (email, nombre, apellido, cedula, telefono, contrasena, rol_id)
  VALUES (_email, _nombre, _apellido, _cedula, _telefono, _contrasena, _rol_id)
  RETURNING id INTO nuevo_id;

  RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--      Ver todos los usuarios
CREATE OR REPLACE FUNCTION listar_usuarios()
RETURNS TABLE(
  id INTEGER,
  email VARCHAR,
  nombre VARCHAR,
  apellido VARCHAR,
  cedula VARCHAR,
  telefono VARCHAR,
  contrasena VARCHAR,
  rol_id INTEGER,
  activo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.email, 
    u.nombre, 
    u.apellido, 
    u.cedula, 
    u.telefono,
    u.contrasena,
    u.rol_id, 
    u.activo
  FROM usuarios u;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--     Ver usuario por filtro (nombre o email)
CREATE OR REPLACE FUNCTION ver_usuarios(filtro TEXT)
RETURNS TABLE(
  id INT,
  email TEXT,
  nombre TEXT,
  apellido TEXT,
  cedula TEXT,
  telefono TEXT,
  contrasena VARCHAR,
  rol_id INT,
  activo BOOLEAN
)AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, nombre, apellido, cedula, telefono, contrasena, rol_id, activo
  FROM usuarios
  WHERE nombre ILIKE '%' || filtro || '%' OR email ILIKE '%' || filtro || '%';
END;
$$ LANGUAGE plpgsql;

-- =============================================
--          Ver usuarios por rol
CREATE OR REPLACE FUNCTION ver_usuarios_por_rol(_rol_id INT)
RETURNS TABLE(
  id INT,
  email TEXT,
  nombre TEXT,
  apellido TEXT,
  cedula TEXT,
  telefono TEXT,
  contrasena VARCHAR,
  activo BOOLEAN
)AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, nombre, apellido, cedula, telefono, contrasena, activo
  FROM usuarios
  WHERE rol_id = _rol_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--        Buscar usuario 
CREATE OR REPLACE FUNCTION buscar_usuario_email(_email VARCHAR(255))
RETURNS TABLE (
  id INT,
  email VARCHAR(255),
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  cedula VARCHAR(20),
  telefono VARCHAR(20),
  contrasena VARCHAR,
  rol_id INT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    usuarios.id, 
    usuarios.email, 
    usuarios.nombre, 
    usuarios.apellido,
    usuarios.cedula, 
    usuarios.telefono,
    usuarios.contrasena,
    usuarios.rol_id
  FROM usuarios
  WHERE usuarios.email = _email;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--        Actualizar usuario
CREATE OR REPLACE FUNCTION actualizar_usuario(
    p_email TEXT,
    p_nombre TEXT,
    p_apellido TEXT,
    p_cedula TEXT,
    p_telefono TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Actualiza los campos especificados para el usuario con el email dado.
    -- Usamos COALESCE(NULLIF(param, ''), columna_actual) para permitir actualizaciones parciales:
    -- Si un parámetro 'p_campo' es NULL o un string vacío, el campo en la tabla no se actualiza,
    -- manteniendo su valor actual. Esto es crucial para que no se borren datos si no se envían.
    UPDATE usuarios
    SET
        nombre = COALESCE(NULLIF(p_nombre, ''), nombre),
        apellido = COALESCE(NULLIF(p_apellido, ''), apellido),
        cedula = COALESCE(NULLIF(p_cedula, ''), cedula),
        telefono = COALESCE(NULLIF(p_telefono, ''), telefono)
    WHERE
        email = p_email;
END;
$$ LANGUAGE plpgsql;


-- =============================================
--       Desactivar (eliminar)
CREATE OR REPLACE FUNCTION desactivar_usuario_por_email(_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE usuarios SET activo = FALSE WHERE email = _email;
END;
$$ LANGUAGE plpgsql;



-- =============================================
--            ENTIDAD CANDIDATO
-- =============================================

--    Insertar nuevo candidato
CREATE OR REPLACE FUNCTION nuevo_candidato(
  _nombre TEXT,
  _descripcion TEXT,
  _imagen_url TEXT  -- nuevo parámetro para la imagen
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO candidatos (nombre, descripcion, imagen_url)
  VALUES (_nombre, _descripcion, _imagen_url);
END;
$$ LANGUAGE plpgsql;



-- =============================================
--      Ver todos los candidatos
CREATE OR REPLACE FUNCTION ver_candidatos()
RETURNS TABLE(
  id INTEGER,
  nombre VARCHAR,
  descripcion TEXT,
  imagen_url VARCHAR,
  activo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, 
    c.nombre, 
    c.descripcion, 
    c.imagen_url,
    c.activo 
  FROM candidatos c
  WHERE c.activo = true;
END;
$$ LANGUAGE plpgsql;


-- =============================================
--      Actualizar candidato existente
CREATE OR REPLACE FUNCTION actualizar_candidato(
  _id INT,
  _nombre TEXT,
  _descripcion TEXT,
  _imagen_url TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE candidatos 
  SET nombre = _nombre,
      descripcion = _descripcion,
      imagen_url = _imagen_url
  WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--      Desactivar (eliminar lógico) candidato
CREATE OR REPLACE FUNCTION desactivar_candidato(_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM candidatos WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--      Eliminar físicamente candidato
CREATE OR REPLACE FUNCTION eliminar_candidato(_id INT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM candidatos WHERE id = _id;
END;
$$ LANGUAGE plpgsql;





-- =============================================
--            ENTIDAD VOTO
-- =============================================

--      Registrar voto
CREATE OR REPLACE FUNCTION registrar_voto(
  _votante_id INT,
  _candidato_id INT,
  _tx_hash TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO votos (votante_id, candidato_id, tx_hash)
  VALUES (_votante_id, _candidato_id, _tx_hash);
END;
$$ LANGUAGE plpgsql;


-- =============================================
--        Lista de votos
CREATE OR REPLACE FUNCTION ver_votos()
RETURNS TABLE(
  votante_email VARCHAR(255),
  votante_nombre VARCHAR(100),
  votante_apellido VARCHAR(100),
  candidato_nombre VARCHAR(255),
  candidato_descripcion TEXT,
  fecha TIMESTAMP,
  tx_hash TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.email,
    u.nombre,
    u.apellido,
    c.nombre,
    c.descripcion,
    v.fecha,
    v.tx_hash
  FROM votos v
  JOIN usuarios u ON v.votante_id = u.id
  JOIN candidatos c ON v.candidato_id = c.id;
END;
$$ LANGUAGE plpgsql;


-- =============================================
--        Lista de votos por candidatos
CREATE OR REPLACE FUNCTION ver_reporte_votos_por_candidato()
RETURNS TABLE (
  id INTEGER,
  nombre VARCHAR,
  total_votos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre,
    COUNT(v.id) AS total_votos
  FROM candidatos c
  LEFT JOIN votos v ON v.candidato_id = c.id
  WHERE c.activo = TRUE
  GROUP BY c.id, c.nombre
  ORDER BY total_votos DESC;
END;
$$ LANGUAGE plpgsql;





-- =============================================
--        Buscar voto por hash
CREATE OR REPLACE FUNCTION ver_voto_por_hash(_hash TEXT)
RETURNS TABLE(
  votante_email VARCHAR,
  candidato_nombre VARCHAR,
  fecha TIMESTAMP,
  tx_hash TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.email, c.nombre, v.fecha, v.tx_hash
  FROM votos v
  JOIN usuarios u ON v.votante_id = u.id
  JOIN candidatos c ON v.candidato_id = c.id
  WHERE v.tx_hash = _hash;
END;
$$ LANGUAGE plpgsql;


