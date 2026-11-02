const mongoose = require("mongoose");

const auditoriaSchema = new mongoose.Schema({
    accion: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});

const userBCSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    wallet: {
        address: { type: String, required: true },
        privateKey: { type: String, required: true }
    },
    firma: { type: String, required: false },
    txHash: { type: String },
    auditoria: [auditoriaSchema],
});

module.exports = mongoose.model("UserBC", userBCSchema);