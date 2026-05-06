const { ok } = require('../utils/respuesta');

const obtenerNotificaciones = async (req, res, next) => {
  try {
    // TODO [Sarah]: listar notificaciones del usuario autenticado
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

const marcarLeida = async (req, res, next) => {
  try {
    // TODO [Sarah]: marcar notificación como leída
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerNotificaciones, marcarLeida };
