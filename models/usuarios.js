const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    credito: { type: Number, required: true },
    envios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Envio' }]
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
