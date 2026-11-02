console.log('🔥 Servidor reiniciado');

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

// Conexión a WebSocket
const { initSocket } = require("./socket/socket.server");

// Conexiones a base de datos
const connectMongo = require("./config/mongo");
const pool = require("./config/postgres"); // asegúrate de que esté configurado correctamente

// Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectMongo();

// Inicializar WebSocket
initSocket(server);

// Rutas
const registerRoute = require("./routes/register.routes");
const votarRoute = require("./routes/votar.routes");
const userRoutes = require("./routes/user.routes");
const rutasMongo = require("./routes/mongo/usuariomg.routes");
const rutasPostgres = require("./routes/postgres/usuariopg.routes");
const candidatoRoutes = require("./routes/postgres/candidato.routes");
const rolRoutes = require("./routes/postgres/rol.routes");
const votosRoutes = require("./routes/postgres/voto.routes");
const reporteRoutes = require("./routes/reporte.routes");
const loginRoutes = require("./routes/login.routes");

// Endpoints
app.use("/api/registro", registerRoute);
app.use("/api/votar", votarRoute);
app.use("/api/usuarios", userRoutes);
app.use("/api/mongo/usuarios", rutasMongo);
app.use("/api/pg/usuarios", rutasPostgres);
app.use("/api/candidatos", candidatoRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/voto", votosRoutes);
app.use("/api/reporte", reporteRoutes);
app.use("/api/login", loginRoutes);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://0.0.0.0:${PORT}`);
});
