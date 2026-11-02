-- psql -U postgres -d votoec -f backend/db/Backup.sql


--    ENTIDAD ROLES
INSERT INTO roles (nombre) VALUES
  ('Administrador'),
  ('Cliente'),
  ('Inivtado');




--  ENTIDAD CANDIDATOS
INSERT INTO candidatos (nombre) VALUES
  ('Mejorar la Infraestructura de la sección Laboratorios'),
  ('Soporte continuo en procesos de finalización de Carrera'),
  ('Mallas curriculares adaptadas a nuevas Tecnologías');



-- 