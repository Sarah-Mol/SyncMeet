const Disponibilidad = require('../models/Disponibilidad');
const Reunion = require('../models/Reunion');
const OpcionHorario = require('../models/OpcionHorario');
const { ok, err } = require('../utils/respuesta');
const { calcularCoincidencias } = require('../services/coincidencias.service');

const registrarDisponibilidad = async (req, res, next) => {
  try {
    const reunionId = req.params.reunionId;
    const { opcionHorarioId, disponible } = req.body;

    if (opcionHorarioId === undefined || disponible === undefined) {
      return res.status(400).json(err('opcionHorarioId y disponible son obligatorios', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('No se puede registrar disponibilidad en una reunión que no está pendiente', 'CONFLICT'));
    }

    const opcion = await OpcionHorario.findOne({ _id: opcionHorarioId, reunionId });
    if (!opcion) {
      return res.status(400).json(err('La opción no pertenece a esta reunión', 'INVALID_OPTION'));
    }

    const disponibilidad = await Disponibilidad.create({
      reunionId,
      participanteId: req.usuarioId,
      opcionHorarioId,
      disponible,
    });

    res.status(201).json(ok(disponibilidad));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json(err('Ya registraste disponibilidad para este horario', 'CONFLICT'));
    }
    next(error);
  }
};

const actualizarDisponibilidad = async (req, res, next) => {
  try {
    const reunionId = req.params.reunionId;
    const { opcionHorarioId, disponible } = req.body;

    if (opcionHorarioId === undefined || disponible === undefined) {
      return res.status(400).json(err('opcionHorarioId y disponible son obligatorios', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('No se puede actualizar disponibilidad en una reunión que no está pendiente', 'CONFLICT'));
    }

    const disponibilidad = await Disponibilidad.findOneAndUpdate(
      { reunionId, participanteId: req.usuarioId, opcionHorarioId },
      { disponible },
      { new: true }
    );

    if (!disponibilidad) {
      return res.status(404).json(err('No has registrado disponibilidad para este horario', 'NOT_FOUND'));
    }

    res.json(ok(disponibilidad));
  } catch (error) {
    next(error);
  }
};

const misDisponibilidades = async (req, res, next) => {
  try {
    const disponibilidades = await Disponibilidad.find({
      reunionId: req.params.reunionId,
      participanteId: req.usuarioId,
    }).populate('opcionHorarioId', 'fechaHora');

    res.json(ok(disponibilidades));
  } catch (error) {
    next(error);
  }
};

const resumenDisponibilidades = async (req, res, next) => {
  try {
    const reunionId = req.params.reunionId;
    const disponibilidades = await Disponibilidad.find({ reunionId });

    const resumen = {};
    disponibilidades.forEach(d => {
      const key = d.opcionHorarioId.toString();
      if (!resumen[key]) resumen[key] = { opcionHorarioId: key, totalDisponibles: 0, total: 0 };
      resumen[key].total++;
      if (d.disponible) resumen[key].totalDisponibles++;
    });

    res.json(ok(Object.values(resumen)));
  } catch (error) {
    next(error);
  }
};

const obtenerCoincidencias = async (req, res, next) => {
  try {
    const resultado = await calcularCoincidencias(req.params.reunionId);
    res.json(ok(resultado));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarDisponibilidad,
  actualizarDisponibilidad,
  misDisponibilidades,
  resumenDisponibilidades,
  obtenerCoincidencias,
};
