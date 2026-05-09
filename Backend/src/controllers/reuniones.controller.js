const Reunion = require('../models/Reunion');
const OpcionHorario = require('../models/OpcionHorario');
const ParticipanteReunion = require('../models/ParticipanteReunion');
const { notificarParticipantes } = require('../services/notificacion.service');
const { ok, err } = require('../utils/respuesta');

const crearReunion = async (req, res, next) => {
  try {
    const { titulo, descripcion, opcionesHorario } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json(err('El título es obligatorio', 'VALIDATION_ERROR'));
    }
    if (!Array.isArray(opcionesHorario) || !opcionesHorario.length) {
      return res.status(400).json(err('Debes incluir al menos una opción de horario', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.create({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim(),
      organizadorId: req.usuarioId,
    });

    await OpcionHorario.insertMany(
      opcionesHorario.map(o => ({ reunionId: reunion._id, fechaHora: new Date(o.fechaHora) }))
    );

    await ParticipanteReunion.create({
      reunionId: reunion._id,
      usuarioId: req.usuarioId,
      rol: 'organizador',
      estado: 'aceptado',
    });

    res.status(201).json(ok({ reunion }));
  } catch (error) {
    next(error);
  }
};

const obtenerReuniones = async (req, res, next) => {
  try {
    const participaciones = await ParticipanteReunion.find({ usuarioId: req.usuarioId })
      .populate({ path: 'reunionId', populate: { path: 'opcionConfirmadaId' } });

    const meetings = participaciones
      .filter(p => p.reunionId)
      .map(p => ({
        ...p.reunionId.toObject(),
        rol: p.rol,
        fechaHoraConfirmada: p.reunionId.opcionConfirmadaId?.fechaHora || null,
      }));

    res.json(ok(meetings));
  } catch (error) {
    next(error);
  }
};

const obtenerReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findById(req.params.id)
      .populate('organizadorId', 'nombre email')
      .populate('opcionConfirmadaId');

    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }

    const participante = await ParticipanteReunion.findOne({
      reunionId: req.params.id,
      usuarioId: req.usuarioId,
    });

    res.json(ok({
      ...reunion.toObject(),
      rol: participante?.rol || null,
      fechaHoraConfirmada: reunion.opcionConfirmadaId?.fechaHora || null,
    }));
  } catch (error) {
    next(error);
  }
};

const editarReunion = async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;
    const reunion = await Reunion.findByIdAndUpdate(
      req.params.id,
      { ...(titulo && { titulo: titulo.trim() }), ...(descripcion !== undefined && { descripcion: descripcion.trim() }) },
      { new: true }
    );
    if (!reunion) return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    res.json(ok({ reunion }));
  } catch (error) {
    next(error);
  }
};

const confirmarReunion = async (req, res, next) => {
  try {
    const { opcionConfirmadaId } = req.body;
    if (!opcionConfirmadaId) {
      return res.status(400).json(err('Debes seleccionar una opción de horario', 'VALIDATION_ERROR'));
    }

    const opcion = await OpcionHorario.findOne({ _id: opcionConfirmadaId, reunionId: req.params.id });
    if (!opcion) {
      return res.status(404).json(err('Opción de horario no encontrada', 'NOT_FOUND'));
    }

    const reunion = await Reunion.findByIdAndUpdate(
      req.params.id,
      { estado: 'confirmada', opcionConfirmadaId },
      { new: true }
    ).populate('opcionConfirmadaId');

    const participantes = await ParticipanteReunion.find({ reunionId: req.params.id });
    const fechaStr = opcion.fechaHora.toLocaleString('es-MX', {
      weekday: 'short', day: 'numeric', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    notificarParticipantes(
      participantes.map(p => p.usuarioId),
      'confirmacion',
      `La reunión "${reunion.titulo}" fue confirmada para el ${fechaStr}.`
    ).catch(() => {});

    res.json(ok({ reunion, fechaHoraConfirmada: opcion.fechaHora }));
  } catch (error) {
    next(error);
  }
};

const cancelarReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findByIdAndUpdate(
      req.params.id,
      { estado: 'cancelada' },
      { new: true }
    );
    if (!reunion) return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));

    const participantes = await ParticipanteReunion.find({ reunionId: req.params.id });
    notificarParticipantes(
      participantes.map(p => p.usuarioId),
      'cancelacion',
      `La reunión "${reunion.titulo}" ha sido cancelada.`
    ).catch(() => {});

    res.json(ok({ reunion }));
  } catch (error) {
    next(error);
  }
};

module.exports = { crearReunion, obtenerReuniones, obtenerReunion, editarReunion, confirmarReunion, cancelarReunion };
