const Reunion = require('../models/Reunion');
const OpcionHorario = require('../models/OpcionHorario');
const Disponibilidad = require('../models/Disponibilidad');
const { ok, err } = require('../utils/respuesta');
const { esFechaFutura } = require('../utils/validaciones');

const agregarOpcion = async (req, res, next) => {
  try {
    const { fechaHora } = req.body;
    const { reunionId } = req.params;

    if (!fechaHora) {
      return res.status(400).json(err('fechaHora es obligatoria', 'VALIDATION_ERROR'));
    }
    if (!esFechaFutura(fechaHora)) {
      return res.status(400).json(err('La fecha debe ser futura', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(400).json(err(`No se pueden agregar opciones a una reunión ${reunion.estado}`, 'INVALID_STATE'));
    }

    const opcion = await OpcionHorario.create({ reunionId, fechaHora });
    res.status(201).json(ok(opcion));
  } catch (error) {
    next(error);
  }
};

const listarOpciones = async (req, res, next) => {
  try {
    const opciones = await OpcionHorario.find({ reunionId: req.params.reunionId })
      .sort({ fechaHora: 1 });
    res.json(ok(opciones));
  } catch (error) {
    next(error);
  }
};

const eliminarOpcion = async (req, res, next) => {
  try {
    const { reunionId, opcionId } = req.params;

    const opcion = await OpcionHorario.findOne({ _id: opcionId, reunionId });
    if (!opcion) {
      return res.status(404).json(err('Opción no encontrada', 'NOT_FOUND'));
    }

    await Disponibilidad.deleteMany({ opcionHorarioId: opcionId });
    await opcion.deleteOne();
    res.json(ok({ mensaje: 'Opción eliminada' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarOpcion, listarOpciones, eliminarOpcion };
