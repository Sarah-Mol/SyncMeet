const { ok, err } = require('../utils/respuesta');

const crearReunion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: crear reunión y agregarla con rol organizador
    res.status(201).json(ok({}));
  } catch (error) {
    next(error);
  }
};

const obtenerReuniones = async (req, res, next) => {
  try {
    // TODO [Emiliano]: listar reuniones del usuario autenticado
    res.json(ok([]));
  } catch (error) {
    next(error);
  }
};

const obtenerReunion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: obtener una reunión por ID
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const editarReunion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: editar titulo/descripción de una reunión
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const confirmarReunion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: confirmar reunión con opción de horario seleccionada
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const cancelarReunion = async (req, res, next) => {
  try {
    // TODO [Emiliano]: cancelar reunión y notificar participantes
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

module.exports = { crearReunion, obtenerReuniones, obtenerReunion, editarReunion, confirmarReunion, cancelarReunion };
