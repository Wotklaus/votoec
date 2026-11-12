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