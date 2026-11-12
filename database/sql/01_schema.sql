CREATE TABLE IF NOT EXISTS users (
                                     id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                     name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'voter' CHECK (role IN ('admin', 'voter')),
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
    );