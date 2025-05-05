const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
  usuarioId: {type: mongoose. Schema.Types.ObjectId,ref: 'Usuario',required: true},
  nombre: {type: String, required: true},
  direccion: {type: String, required: true},
  telefono: {type: String, required: true},
  referencia: {type: String, default: ''},
  observacion: {type: String, default: ''},
  productos: [
    {
      descripcion: {type: String,required: true},
      peso: {type: Number,required: true},
      bultos: {type: Number, required: true},
      fecha_entrega: { type: Date, required: true }
    }
  ],
  costo: {type: Number,required: true}
}, { timestamps: true });

module.exports = mongoose.model('Envio', envioSchema);