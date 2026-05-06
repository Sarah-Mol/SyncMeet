const { ok } = require('../utils/respuesta');

const agregarParticipante = async (req, res, next) => {
  try {
    // TODO [Emiliano]: agregar participante a la reunión y enviar invitación
    res.status(201).json(ok({}));
  } catch (error) {
    next(error);
  }
};

const listarParticipantes = async (req, res, next) => {
  try {
    // TODO [Emiliano]: listar participantes de una reunión
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

const eliminarParticipante = async (req, res, next) => {
  try {
    // TODO [Emiliano]: eliminar participante de una reunión
    res.json(ok({ mensaje: 'Participante eliminado' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarParticipante, listarParticipantes, eliminarParticipante };
