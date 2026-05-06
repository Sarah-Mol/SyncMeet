const { ok } = require('../utils/respuesta');

const agregarOpcion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: agregar opción de horario a una reunión
    res.status(201).json(ok({}));
  } catch (error) {
    next(error);
  }
};

const listarOpciones = async (req, res, next) => {
  try {
    // TODO [Emiliano]: listar opciones de horario de una reunión
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

const eliminarOpcion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: eliminar opción de horario
    res.json(ok({ mensaje: 'Opción eliminada' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarOpcion, listarOpciones, eliminarOpcion };
