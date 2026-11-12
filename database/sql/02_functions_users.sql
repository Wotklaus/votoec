-- Crea un usuario y devuelve sus datos, sin la contraseña.
CREATE OR REPLACE FUNCTION create_user(
    p_name     VARCHAR,
    p_email    VARCHAR,
    p_password VARCHAR
)
    RETURNS TABLE (
                      id         INTEGER,
                      name       VARCHAR,
                      email      VARCHAR,
                      role       VARCHAR,
                      created_at TIMESTAMPTZ
                  )
    LANGUAGE sql
AS $$
INSERT INTO users (name, email, password)
VALUES (p_name, p_email, p_password)
RETURNING id, name, email, role, created_at;
$$;

-- Lista todos los usuarios, del más antiguo al más nuevo, sin la contraseña.
CREATE OR REPLACE FUNCTION list_users()
    RETURNS TABLE (
                      id         INTEGER,
                      name       VARCHAR,
                      email      VARCHAR,
                      role       VARCHAR,
                      active     BOOLEAN,
                      created_at TIMESTAMPTZ
                  )
    LANGUAGE sql
AS $$
SELECT u.id, u.name, u.email, u.role, u.active, u.created_at
FROM users AS u
ORDER BY u.created_at ASC;
$$;

-- Busca un usuario por email para el login.
-- Es la ÚNICA función que devuelve el hash de la contraseña: úsala solo para verificarla.
CREATE OR REPLACE FUNCTION find_user_for_login(
    p_email VARCHAR
)
    RETURNS TABLE (
                      id       INTEGER,
                      name     VARCHAR,
                      role     VARCHAR,
                      active   BOOLEAN,
                      password VARCHAR
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT u.id, u.name, u.role, u.active, u.password
FROM users AS u
WHERE u.email = p_email;
$$;

-- Busca un usuario por id, sin la contraseña. Mismas columnas que list_users().
CREATE OR REPLACE FUNCTION find_user_by_id(
    p_id INTEGER
)
    RETURNS TABLE (
                      id         INTEGER,
                      name       VARCHAR,
                      email      VARCHAR,
                      role       VARCHAR,
                      active     BOOLEAN,
                      created_at TIMESTAMPTZ
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT u.id, u.name, u.email, u.role, u.active, u.created_at
FROM users AS u
WHERE u.id = p_id;
$$;

-- Actualiza nombre, email y rol. Devuelve el id, o ninguna fila si el usuario no existe.
CREATE OR REPLACE FUNCTION update_user(
    p_id    INTEGER,
    p_name  VARCHAR,
    p_email VARCHAR,
    p_role  VARCHAR
)
    RETURNS TABLE (
                      id INTEGER
                  )
    LANGUAGE sql
AS $$
UPDATE users AS u
SET name       = p_name,
    email      = p_email,
    role       = p_role,
    updated_at = now()
WHERE u.id = p_id
RETURNING u.id;
$$;

-- Desactiva un usuario (borrado lógico). Devuelve el id, o ninguna fila si no existe.
CREATE OR REPLACE FUNCTION deactivate_user(
    p_id INTEGER
)
    RETURNS TABLE (
                      id INTEGER
                  )
    LANGUAGE sql
AS $$
UPDATE users AS u
SET active     = FALSE,
    updated_at = now()
WHERE u.id = p_id
RETURNING u.id;
$$;

-- Vuelve a activar un usuario. Devuelve el id, o ninguna fila si no existe.
CREATE OR REPLACE FUNCTION activate_user(
    p_id INTEGER
)
    RETURNS TABLE (
                      id INTEGER
                  )
    LANGUAGE sql
AS $$
UPDATE users AS u
SET active     = TRUE,
    updated_at = now()
WHERE u.id = p_id
RETURNING u.id;
$$;
