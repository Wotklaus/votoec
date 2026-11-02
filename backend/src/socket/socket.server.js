// src/socket/socket.server.js
const { Server } = require("socket.io");
const { iniciarKafkaConsumers } = require("../kafka/kafkaConsumer");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // ajusta según tu caso
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado vía WebSocket");

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado");
    });
  });

  iniciarKafkaConsumers(io).catch((err) => {
    console.error("❌ Error iniciando Kafka consumer:", err);
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io no inicializado");
  }
  return io;
}

module.exports = { initSocket, getIO };
