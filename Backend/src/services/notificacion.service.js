const Notificacion = require('../models/Notificacion');

const crearNotificacion = async ({ usuarioId, tipo, mensaje }) => {
  return await Notificacion.create({ usuarioId, tipo, mensaje });
};

const notificarParticipantes = async (participantesIds, tipo, mensaje) => {
  const docs = participantesIds.map(id => ({ usuarioId: id, tipo, mensaje }));
  await Notificacion.insertMany(docs);
};

module.exports = { crearNotificacion, notificarParticipantes };
