const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASS,
    port: process.env.PG_PORT || 5432,
});

pool.connect()
    .then(() => console.log("Conectado a PostgreSQL"))
    .catch(err => {
        console.error("Error al conectar PostgreSQL", err.message);
        process.exit(1);
    });

module.exports = pool;


