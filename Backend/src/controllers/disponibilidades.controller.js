const Disponibilidad = require('../models/Disponibilidad');
const OpcionHorario = require('../models/OpcionHorario');
const { calcularCoincidencias } = require('../services/coincidencias.service');
const { ok, err } = require('../utils/respuesta');

const registrarDisponibilidad = async (req, res, next) => {
  try {
    const { opcionHorarioId, disponible } = req.body;
    const { reunionId } = req.params;

    if (!opcionHorarioId || disponible === undefined) {
      return res.status(400).json(err('opcionHorarioId y disponible son obligatorios', 'VALIDATION_ERROR'));
    }

    const opcion = await OpcionHorario.findOne({ _id: opcionHorarioId, reunionId });
    if (!opcion) {
      return res.status(404).json(err('Opción de horario no pertenece a esta reunión', 'NOT_FOUND'));
    }

    const disp = await Disponibilidad.create({
      reunionId,
      participanteId: req.usuarioId,
      opcionHorarioId,
      disponible,
    });

    res.status(201).json(ok(disp));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json(err('Ya registraste disponibilidad para esta opción', 'CONFLICT'));
    }
    next(error);
  }
};

const actualizarDisponibilidad = async (req, res, next) => {
  try {
    const { disponible } = req.body;
    const { reunionId, disponibilidadId } = req.params;

    if (disponible === undefined) {
      return res.status(400).json(err('disponible es obligatorio', 'VALIDATION_ERROR'));
    }

    const disp = await Disponibilidad.findOne({
      _id: disponibilidadId,
      reunionId,
      participanteId: req.usuarioId,
    });

    if (!disp) {
      return res.status(404).json(err('Disponibilidad no encontrada', 'NOT_FOUND'));
    }

    disp.disponible = disponible;
    await disp.save();
    res.json(ok(disp));
  } catch (error) {
    next(error);
  }
};

const obtenerDisponibilidades = async (req, res, next) => {
  try {
    const disponibilidades = await Disponibilidad.find({ reunionId: req.params.reunionId })
      .populate('participanteId', '-password')
      .populate('opcionHorarioId');
    res.json(ok(disponibilidades));
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

module.exports = { registrarDisponibilidad, actualizarDisponibilidad, obtenerDisponibilidades, obtenerCoincidencias };
