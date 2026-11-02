require("dotenv").config();
const { ethers } = require("ethers");
const connectMongo = require("../config/mongo");
const contratoJson = require("../VotoEC.json");
const { Kafka } = require("kafkajs");

// DAOs
const UserBCDAO = require("../dao/mongo/userBCDAO");
const VotoDAO = require("../dao/postgres/votoDAO");
const UsuarioDAO = require("../dao/postgres/usuarioDAO");

(async () => {
  const kafka = new Kafka({ clientId: "votoec-listener", brokers: [process.env.KAFKA_BROKER || "kafka:9092"] });  //Cambiar brokers: ["192.168.100.6:9092"] POR [process.env.KAFKA_BROKER || "kafka:9092"]
  const producer = kafka.producer();
  await producer.connect();

  await connectMongo();
  console.log("Conectado a PostgreSQL");

  const userBCDAO = new UserBCDAO();
  const votoDAO = new VotoDAO();
  const usuarioDAO = new UsuarioDAO();

  const provider = new ethers.WebSocketProvider(process.env.RPC_WSS_URL);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contratoJson.abi, provider);

  console.log("📡 Escuchando eventos en la blockchain...");

  // 🎯 Evento VotoEmitido
  contract.on("VotoEmitido", async (votante, opcion, txHash) => {
    const emitTimestamp = Date.now();
    console.time("⏱️ Tiempo total - Evento VotoEmitido");

    console.log(`🗳️ Voto registrado: 
      ➤ Votante: ${votante}
      ➤ Opción: ${opcion}
      ➤ TxHash: ${txHash}`);

    try {
      console.time("⏱️ Mongo: Buscar por address");
      const usuarioMongo = await userBCDAO.buscarPorAddress(votante);
      console.timeEnd("⏱️ Mongo: Buscar por address");

      const email = usuarioMongo?.email;

      if (email) {
        console.time("⏱️ Postgres: Buscar por email");
        const usuarioPG = await usuarioDAO.buscarPorEmail(email);
        console.timeEnd("⏱️ Postgres: Buscar por email");

        if (usuarioPG?.id) {
          console.time("⏱️ PostgreSQL: Registrar voto");
          await votoDAO.registrar({
            usuarioId: usuarioPG.id,
            candidatoId: opcion.toString(),
            txHash
          });
          console.timeEnd("⏱️ PostgreSQL: Registrar voto");

          const datosActualizados = {
            voto: { opcion: opcion.toString(), fecha: new Date() },
            txHash
          };

          console.time("⏱️ Mongo: Actualizar voto");
          await userBCDAO.registrarVoto(email, datosActualizados);
          console.timeEnd("⏱️ Mongo: Actualizar voto");

          console.log(`✅ Voto registrado en MongoDB y PostgreSQL para ${email}`);

          console.time("⏱️ Kafka: Enviar nuevoVoto");
          await producer.send({
            topic: "nuevoVoto",
            messages: [
              {
                value: JSON.stringify({
                  votante,
                  opcion: opcion.toString(),
                  txHash,
                  email,
                  timestamp: emitTimestamp
                })
              }
            ]
          });
          console.timeEnd("⏱️ Kafka: Enviar nuevoVoto");
        }
      } else {
        console.warn("⚠️ No se encontró email asociado a la wallet:", votante);
      }
    } catch (err) {
      console.error("❌ Error al procesar evento:", err.message);
    }

    console.timeEnd("⏱️ Tiempo total - Evento VotoEmitido");
  });

  // 👤 Evento UsuarioRegistrado
  contract.on("UsuarioRegistrado", async (wallet, email) => {
    const timestamp = Date.now();
    console.time("⏱️ Kafka: Enviar nuevoUsuario");

    console.log(`👤 Usuario registrado → Wallet: ${wallet}, Email: ${email}`);
    await producer.send({
      topic: "nuevoUsuario",
      messages: [
        {
          value: JSON.stringify({ wallet, email, timestamp })
        }
      ]
    });

    console.timeEnd("⏱️ Kafka: Enviar nuevoUsuario");
  });

  // 📊 Evento RecuentoActualizado
  contract.on("RecuentoActualizado", async (opcion, totalVotos, porcentaje) => {
    const timestamp = Date.now();
    console.time("⏱️ Kafka: Enviar recuentoActualizado");

    console.log(`📊 Recuento actualizado:
      ➤ Opción: ${opcion}
      ➤ Total votos: ${totalVotos}
      ➤ Porcentaje: ${porcentaje}%`);

    await producer.send({
      topic: "recuentoActualizado",
      messages: [
        {
          value: JSON.stringify({
            opcion: opcion.toString(),
            totalVotos: totalVotos.toString(),
            porcentaje: parseFloat(porcentaje),
            timestamp
          })
        }
      ]
    });

    console.timeEnd("⏱️ Kafka: Enviar recuentoActualizado");
  });

  



  // 👑 Evento CambioDeLider
  contract.on("CambioDeLider", async (nuevoLider, votos) => {
    const timestamp = Date.now();
    console.time("⏱️ Kafka: Enviar nuevoLider");

    console.log(`👑 Nuevo líder:
      ➤ Candidato: ${nuevoLider}
      ➤ Votos: ${votos}`);

    await producer.send({
      topic: "nuevoLider",
      messages: [
        {
          value: JSON.stringify({
            nuevoLider: nuevoLider.toString(),
            votos: votos.toString(),
            timestamp
          })
        }
      ]
    });

    console.timeEnd("⏱️ Kafka: Enviar nuevoLider");
  });
})();
