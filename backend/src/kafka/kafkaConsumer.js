const { Kafka } = require("kafkajs");
const nodemailer = require("nodemailer");
const Notificacion = require("../models/notificacion");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCorreo = async (para, asunto, mensaje, contexto = "") => {
  const log = { email: para, asunto, mensaje, timestamp: new Date() };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: para,
    subject: asunto,
    text: mensaje,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Correo enviado a: ${para} ${contexto}`);
    log.estado = "exitoso";
  } catch (error) {
    console.error(`❌ Error al enviar correo a ${para} ${contexto} →`, error.message);
    log.estado = "fallido";
    log.error = error.message;
  }

  // Guardar log en MongoDB
  await Notificacion.create(log);
};

async function iniciarKafkaConsumers(io) {
  const kafka = new Kafka({
    clientId: "votoec-socket",
    brokers: [process.env.KAFKA_BROKER || "kafka:9092"],  //Cambiar brokers: ["192.168.100.6:9092"] POR [process.env.KAFKA_BROKER || "kafka:9092"]
    requestTimeout: 30000, // 30 segundos
    connectionTimeout: 10000, // 10 segundos
});

  const consumer = kafka.consumer({ groupId: "votoec-websocket-group" });
  await consumer.connect();

  const topics = ["nuevoVoto", "nuevoUsuario", "recuentoActualizado", "nuevoLider"];
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`📨 Kafka → ${topic}:`, data);

      // Emitir evento por WebSocket
      io.emit(topic, data);

      switch (topic) {
        case "nuevoUsuario":
          try {
            if (data.email) {
              await enviarCorreo(
                data.email,
                "🎉 Registro Exitoso en VotoEC",
                `Bienvenido/a, tu wallet registrada es: ${data.wallet}`,
                "[nuevoUsuario - usuario]"
              );
            }
            if (adminEmails.length > 0) {
              await Promise.all(
                adminEmails.map((admin) =>
                  enviarCorreo(
                    admin,
                    "🆕 Nuevo Usuario Registrado",
                    `Nuevo usuario registrado: ${data.email}, Wallet: ${data.wallet}`,
                    "[nuevoUsuario - admin]"
                  )
                )
              );
            }
          } catch (error) {
            console.error("❌ Error enviando correos en evento nuevoUsuario:", error);
          }
          break;

        case "nuevoVoto":
          try {
            if (data.email) {
              await enviarCorreo(
                data.email,
                "🗳️ Voto registrado",
                `Tu voto fue emitido correctamente para la opción ${data.opcion}. TxHash: ${data.txHash}`,
                "[nuevoVoto - usuario]"
              );
            }
            if (adminEmails.length > 0) {
              await Promise.all(
                adminEmails.map((admin) =>
                  enviarCorreo(
                    admin,
                    "📥 Nuevo Voto Emitido",
                    `Votante: ${data.votante}\nOpción: ${data.opcion}\nTxHash: ${data.txHash}`,
                    "[nuevoVoto - admin]"
                  )
                )
              );
            }
          } catch (error) {
            console.error("❌ Error enviando correos en evento nuevoVoto:", error);
          }
          break;

        case "nuevoLider":
          try {
            if (data.email) {
              await enviarCorreo(
                data.email,
                "🏆 Nuevo líder en la votación",
                `La opción ${data.opcion} es el nuevo líder con ${data.totalVotos} votos.`,
                "[nuevoLider - usuario]"
              );
            }
            if (adminEmails.length > 0) {
              await Promise.all(
                adminEmails.map((admin) =>
                  enviarCorreo(
                    admin,
                    "📊 Nuevo Líder Detectado",
                    `Nueva opción líder: ${data.opcion}\nTotal votos: ${data.totalVotos}`,
                    "[nuevoLider - admin]"
                  )
                )
              );
            }
          } catch (error) {
            console.error("❌ Error enviando correos en evento nuevoLider:", error);
          }
          break;

        case "recuentoActualizado":
          // Por ahora no notifica a nadie
          break;
      }
    },
  });
}

module.exports = { iniciarKafkaConsumers };
