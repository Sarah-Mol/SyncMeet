const Reunion = require('../models/Reunion');
const OpcionHorario = require('../models/OpcionHorario');
const ParticipanteReunion = require('../models/ParticipanteReunion');
const { ok, err } = require('../utils/respuesta');
const { notificarParticipantes } = require('../services/notificacion.service');
const { enviarConfirmacion, enviarCancelacion } = require('../services/correo.service');

const crearReunion = async (req, res, next) => {
  try {
    const { titulo, descripcion, opcionesHorario } = req.body;

    if (!titulo) {
      return res.status(400).json(err('El título es obligatorio', 'VALIDATION_ERROR'));
    }
    if (!opcionesHorario || opcionesHorario.length === 0) {
      return res.status(400).json(err('Se requiere al menos una opción de horario', 'VALIDATION_ERROR'));
    }

    const reunion = await Reunion.create({ titulo, descripcion, organizadorId: req.usuarioId });

    const opciones = await OpcionHorario.insertMany(
      opcionesHorario.map(op => ({ reunionId: reunion._id, fechaHora: op.fechaHora }))
    );

    await ParticipanteReunion.create({
      reunionId: reunion._id,
      usuarioId: req.usuarioId,
      rol: 'organizador',
    });

    res.status(201).json(ok({ reunion, opciones }));
  } catch (error) {
    next(error);
  }
};

const obtenerReuniones = async (req, res, next) => {
  try {
    const participaciones = await ParticipanteReunion.find({ usuarioId: req.usuarioId });
    const reunionIds = participaciones.map(p => p.reunionId);

    const reuniones = await Reunion.find({ _id: { $in: reunionIds } });

    const rolPor = {};
    participaciones.forEach(p => { rolPor[p.reunionId.toString()] = p.rol; });

    const resultado = reuniones.map(r => ({
      ...r.toObject(),
      rol: rolPor[r._id.toString()],
    }));

    res.json(ok(resultado));
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

    const esMiembro = await ParticipanteReunion.exists({ reunionId: req.params.id, usuarioId: req.usuarioId });
    if (!esMiembro) {
      return res.status(403).json(err('No eres participante de esta reunión', 'FORBIDDEN'));
    }

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

const editarReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('Solo se puede editar una reunión en estado pendiente', 'CONFLICT'));
    }

    const { titulo, descripcion } = req.body;
    if (titulo !== undefined) reunion.titulo = titulo;
    if (descripcion !== undefined) reunion.descripcion = descripcion;
    await reunion.save();

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

const confirmarReunion = async (req, res, next) => {
  try {
    const reunion = await Reunion.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('Solo se puede confirmar una reunión en estado pendiente', 'CONFLICT'));
    }

    const { opcionConfirmadaId } = req.body;
    if (!opcionConfirmadaId) {
      return res.status(400).json(err('Se requiere opcionConfirmadaId', 'VALIDATION_ERROR'));
    }

    const opcion = await OpcionHorario.findOne({ _id: opcionConfirmadaId, reunionId: req.params.id });
    if (!opcion) {
      return res.status(400).json(err('La opción no pertenece a esta reunión', 'INVALID_OPTION'));
    }

    reunion.estado = 'confirmada';
    reunion.opcionConfirmadaId = opcion._id;
    await reunion.save();

    const participaciones = await ParticipanteReunion.find({ reunionId: reunion._id })
      .populate('usuarioId', 'nombre email');

    const ids = participaciones.map(p => p.usuarioId._id);
    notificarParticipantes(ids, 'confirmacion', `La reunión "${reunion.titulo}" ha sido confirmada`)
      .catch(e => console.error('Error al crear notificaciones:', e.message));

    participaciones.forEach(p => {
      enviarConfirmacion({ destinatario: p.usuarioId.email, nombre: p.usuarioId.nombre, reunion, fechaHora: opcion.fechaHora });
    });

    res.json(ok({ ...reunion.toObject(), fechaHoraConfirmada: opcion.fechaHora }));
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
      return res.status(409).json(err('La reunión ya está cancelada', 'CONFLICT'));
    }

    reunion.estado = 'cancelada';
    await reunion.save();

    const participaciones = await ParticipanteReunion.find({ reunionId: reunion._id })
      .populate('usuarioId', 'nombre email');

    const ids = participaciones.map(p => p.usuarioId._id);
    notificarParticipantes(ids, 'cancelacion', `La reunión "${reunion.titulo}" ha sido cancelada`)
      .catch(e => console.error('Error al crear notificaciones:', e.message));

    participaciones.forEach(p => {
      enviarCancelacion({ destinatario: p.usuarioId.email, nombre: p.usuarioId.nombre, reunion });
    });

    res.json(ok(reunion));
  } catch (error) {
    next(error);
  }
};

module.exports = { crearReunion, obtenerReuniones, obtenerReunion, editarReunion, confirmarReunion, cancelarReunion };
