const mongoose = require('mongoose');

const participanteReunionSchema = new mongoose.Schema({
  reunionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reunion', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  rol: { type: String, enum: ['organizador', 'participante'], required: true },
  estado: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente' },
}, { timestamps: true });

module.exports = mongoose.model('ParticipanteReunion', participanteReunionSchema);
