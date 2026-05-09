const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  reunionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reunion', default: null },
  tipo: { type: String, enum: ['invitacion', 'confirmacion', 'cancelacion', 'recordatorio'], required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notificacion', notificacionSchema);
