const Reunion = require('../models/Reunion');
const OpcionHorario = require('../models/OpcionHorario');
const Disponibilidad = require('../models/Disponibilidad');
const { ok, err } = require('../utils/respuesta');
const { esFechaFutura } = require('../utils/validaciones');

const agregarOpcion = async (req, res, next) => {
  try {
    const reunionId = req.params.reunionId;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('Solo se pueden agregar opciones a una reunión pendiente', 'CONFLICT'));
    }

    const { fechaHora } = req.body;
    if (!fechaHora || !esFechaFutura(fechaHora)) {
      return res.status(400).json(err('La fecha y hora debe ser una fecha futura válida', 'VALIDATION_ERROR'));
    }

    const opcion = await OpcionHorario.create({ reunionId, fechaHora });
    res.status(201).json(ok(opcion));
  } catch (error) {
    next(error);
  }
};

const listarOpciones = async (req, res, next) => {
  try {
    const opciones = await OpcionHorario.find({ reunionId: req.params.reunionId });
    res.json(ok(opciones));
  } catch (error) {
    next(error);
  }
};

const eliminarOpcion = async (req, res, next) => {
  try {
    const { reunionId, opcionId } = req.params;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('Solo se pueden eliminar opciones de una reunión pendiente', 'CONFLICT'));
    }

    const tieneDisponibilidades = await Disponibilidad.exists({ opcionHorarioId: opcionId });
    if (tieneDisponibilidades) {
      return res.status(409).json(err('No se puede eliminar una opción que ya tiene disponibilidades registradas', 'CONFLICT'));
    }

    await OpcionHorario.deleteOne({ _id: opcionId, reunionId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarOpcion, listarOpciones, eliminarOpcion };
