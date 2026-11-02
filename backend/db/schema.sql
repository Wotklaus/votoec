-- ============================================
--          CREACIÓN BASE DE DATOS
-- ============================================
-- psql -U postgres -f backend/db/schema.sql

--CREATE DATABASE votoec;

-- ============================================
-- USAR LA BASE DE DATOS (esto se hace desde la consola):
-- psql -U postgres -d votoec -f backend/db/schema.sql
-- ============================================



-- ============================================
--                  ENTIDADES
-- ============================================

--    ENTIDAD ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

--    ENTIDAD USUARIO
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(20),
  telefono VARCHAR(20),
  contrasena VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  rol_id INTEGER NOT NULL REFERENCES roles(id)
);

--    ENTIDAD CANDIDATOS0
CREATE TABLE candidatos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  imagen_url VARCHAR(500)  
);

--      ENTIDAD VOTOS
CREATE TABLE IF NOT EXISTS votos (
  id SERIAL PRIMARY KEY,
  votante_id INTEGER NOT NULL,
  candidato_id INTEGER NOT NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  tx_hash TEXT UNIQUE NOT NULL,
  FOREIGN KEY (votante_id) REFERENCES usuarios(id),
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id)
);

