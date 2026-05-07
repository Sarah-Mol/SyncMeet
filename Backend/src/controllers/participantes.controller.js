const Usuario = require('../models/Usuario');
const Reunion = require('../models/Reunion');
const ParticipanteReunion = require('../models/ParticipanteReunion');
const { ok, err } = require('../utils/respuesta');
const { crearNotificacion } = require('../services/notificacion.service');
const { enviarInvitacion } = require('../services/correo.service');

const agregarParticipante = async (req, res, next) => {
  try {
    const reunionId = req.params.reunionId;
    const { usuarioId } = req.body;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json(err('Usuario no encontrado', 'NOT_FOUND'));
    }

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('No se pueden agregar participantes a una reunión que no está pendiente', 'CONFLICT'));
    }

    const existe = await ParticipanteReunion.exists({ reunionId, usuarioId });
    if (existe) {
      return res.status(409).json(err('El usuario ya es participante de esta reunión', 'CONFLICT'));
    }

    const participante = await ParticipanteReunion.create({ reunionId, usuarioId, rol: 'participante' });

    crearNotificacion({ usuarioId, tipo: 'invitacion', mensaje: `Has sido invitado a la reunión "${reunion.titulo}"` })
      .catch(e => console.error('Error al crear notificación:', e.message));
    enviarInvitacion({ destinatario: usuario.email, nombre: usuario.nombre, reunion });

    res.status(201).json(ok(participante));
  } catch (error) {
    next(error);
  }
};

const listarParticipantes = async (req, res, next) => {
  try {
    const participantes = await ParticipanteReunion.find({ reunionId: req.params.reunionId })
      .populate('usuarioId', 'nombre email');
    res.json(ok(participantes));
  } catch (error) {
    next(error);
  }
};

const eliminarParticipante = async (req, res, next) => {
  try {
    const { reunionId, usuarioId } = req.params;

    const reunion = await Reunion.findById(reunionId);
    if (!reunion) {
      return res.status(404).json(err('Reunión no encontrada', 'NOT_FOUND'));
    }
    if (reunion.estado !== 'pendiente') {
      return res.status(409).json(err('No se pueden eliminar participantes de una reunión que no está pendiente', 'CONFLICT'));
    }

    const participante = await ParticipanteReunion.findOne({ reunionId, usuarioId });
    if (!participante) {
      return res.status(404).json(err('Participante no encontrado', 'NOT_FOUND'));
    }
    if (participante.rol === 'organizador') {
      return res.status(403).json(err('No se puede eliminar al organizador de la reunión', 'FORBIDDEN'));
    }

    await ParticipanteReunion.deleteOne({ _id: participante._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarParticipante, listarParticipantes, eliminarParticipante };
