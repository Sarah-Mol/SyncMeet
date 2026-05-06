const Notificacion = require('../models/Notificacion');

const crearNotificacion = async ({ usuarioId, tipo, mensaje }) => {
  // TODO [Sarah]: guardar notificación interna en BD
  return await Notificacion.create({ usuarioId, tipo, mensaje });
};

module.exports = { crearNotificacion };
