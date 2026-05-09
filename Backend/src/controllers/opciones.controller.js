const OpcionHorario = require('../models/OpcionHorario');
const { ok, err } = require('../utils/respuesta');

const agregarOpcion = async (req, res, next) => {
  try {
    const { fechaHora } = req.body;
    if (!fechaHora) {
      return res.status(400).json(err('La fechaHora es obligatoria', 'VALIDATION_ERROR'));
    }
    const opcion = await OpcionHorario.create({ reunionId: req.params.reunionId, fechaHora: new Date(fechaHora) });
    res.status(201).json(ok({ opcion }));
  } catch (error) {
    next(error);
  }
};

const listarOpciones = async (req, res, next) => {
  try {
    const opciones = await OpcionHorario.find({ reunionId: req.params.reunionId }).sort({ fechaHora: 1 });
    res.json(ok(opciones));
  } catch (error) {
    next(error);
  }
};

const eliminarOpcion = async (req, res, next) => {
  try {
    const resultado = await OpcionHorario.findOneAndDelete({
      _id: req.params.opcionId,
      reunionId: req.params.reunionId,
    });
    if (!resultado) {
      return res.status(404).json(err('Opción de horario no encontrada', 'NOT_FOUND'));
    }
    res.json(ok({ mensaje: 'Opción eliminada' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarOpcion, listarOpciones, eliminarOpcion };
