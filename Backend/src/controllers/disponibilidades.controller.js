const { ok } = require('../utils/respuesta');

const registrarDisponibilidad = async (req, res, next) => {
  try {
    // TODO [Jimena]: registrar disponibilidad de un participante para una opción de horario
    res.status(201).json(ok({}));
  } catch (error) {
    next(error);
  }
};

const actualizarDisponibilidad = async (req, res, next) => {
  try {
    // TODO [Jimena]: actualizar disponibilidad existente
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const obtenerDisponibilidades = async (req, res, next) => {
  try {
    // TODO [Jimena]: obtener todas las disponibilidades de una reunión
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

const obtenerCoincidencias = async (req, res, next) => {
  try {
    // TODO [Jimena]: calcular y retornar opciones ordenadas por cantidad de disponibles
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

module.exports = { registrarDisponibilidad, actualizarDisponibilidad, obtenerDisponibilidades, obtenerCoincidencias };
