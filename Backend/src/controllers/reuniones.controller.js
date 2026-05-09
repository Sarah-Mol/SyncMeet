const Reunion = require('../models/Reunion');
const ParticipanteReunion = require('../models/ParticipanteReunion');
const OpcionHorario = require('../models/OpcionHorario');
const { crearNotificacion, notificarParticipantes } = require('../services/notificacion.service');
const { enviarConfirmacion, enviarCancelacion } = require('../services/correo.service');
const { ok, err } = require('../utils/respuesta');

const crearReunion = async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;
    if (!titulo || !titulo.trim()) {
      return res.status(400).json(err('El título es obligatorio', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.create({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim(),
      organizadorId: req.usuarioId,
    });

    await ParticipanteReunion.create({
      reunionId: reunion._id,
      usuarioId: req.usuarioId,
      rol: 'organizador',
      estado: 'aceptado',
    });

    res.status(201).json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

const obtenerReuniones = async (req, res, next) => {
  try {
    const participaciones = await ParticipanteReunion.find({ usuarioId: req.usuarioId })
      .populate('reunionId')
      .sort({ createdAt: -1 });

    const reuniones = participaciones
      .filter(p => p.reunionId)
      .map(p => ({ ...p.reunionId.toObject(), miRol: p.rol, miEstado: p.estado }));

    res.json(ok(reuniones));
  } catch (error) {
    next(error);
  }
};

const obtenerReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }

    const participacion = await ParticipanteReunion.findOne({
      reunionId: reunion._id,
      usuarioId: req.usuarioId,
    });
    if (!participacion) {
      return res.status(403).json(err('No tienes acceso a esta reunión', 'FORBIDDEN'));
    }

    res.json(ok({ ...reunion.toObject(), miRol: participacion.rol }));
  } catch (error) {
    next(error);
  }
};

const editarReunion = async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;
    if (titulo !== undefined && !titulo.trim()) {
      return res.status(400).json(err('El título no puede estar vacío', 'VALIDATION_ERROR'));
    }

    const cambios = {};
    if (titulo) cambios.titulo = titulo.trim();
    if (descripcion !== undefined) cambios.descripcion = descripcion.trim();

    const reunion = await Reunion.findByIdAndUpdate(req.params.id, cambios, { new: true });
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

const confirmarReunion = async (req, res, next) => {
  try {
    const { opcionId } = req.body;
    if (!opcionId) {
      return res.status(400).json(err('Se requiere opcionId', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(400).json(err(`La reunión ya está ${reunion.estado}`, 'INVALID_STATE'));
    }

    const opcion = await OpcionHorario.findOne({ _id: opcionId, reunionId: reunion._id });
    if (!opcion) {
      return res.status(404).json(err('Opción de horario no pertenece a esta reunión', 'NOT_FOUND'));
    }

    reunion.estado = 'confirmada';
    reunion.opcionConfirmadaId = opcion._id;
    await reunion.save();

    const participantes = await ParticipanteReunion.find({ reunionId: reunion._id })
      .populate('usuarioId');

    const fechaHora = new Date(opcion.fechaHora).toLocaleString('es-MX', {
      dateStyle: 'long', timeStyle: 'short',
    });
    const ids = participantes.map(p => p.usuarioId._id);
    await notificarParticipantes(
      ids, 'confirmacion',
      `La reunión "${reunion.titulo}" fue confirmada para el ${fechaHora}`,
      reunion._id,
    );

    for (const p of participantes) {
      await enviarConfirmacion({
        destinatario: p.usuarioId.email,
        nombre: p.usuarioId.nombre,
        reunion,
        fechaHora,
      });
    }

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

const cancelarReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado === 'cancelada') {
      return res.status(400).json(err('La reunión ya está cancelada', 'INVALID_STATE'));
    }

    reunion.estado = 'cancelada';
    await reunion.save();

    const participantes = await ParticipanteReunion.find({ reunionId: reunion._id })
      .populate('usuarioId');

    const ids = participantes.map(p => p.usuarioId._id);
    await notificarParticipantes(
      ids, 'cancelacion',
      `La reunión "${reunion.titulo}" fue cancelada`,
      reunion._id,
    );

    for (const p of participantes) {
      await enviarCancelacion({
        destinatario: p.usuarioId.email,
        nombre: p.usuarioId.nombre,
        reunion,
      });
    }

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

module.exports = { crearReunion, obtenerReuniones, obtenerReunion, editarReunion, confirmarReunion, cancelarReunion };
