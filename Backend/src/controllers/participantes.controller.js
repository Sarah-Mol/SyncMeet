const ParticipanteReunion = require('../models/ParticipanteReunion');
const Reunion = require('../models/Reunion');
const { crearNotificacion } = require('../services/notificacion.service');
const { ok, err } = require('../utils/respuesta');

const agregarParticipante = async (req, res, next) => {
  try {
    const { reunionId } = req.params;
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json(err('El usuarioId es obligatorio', 'VALIDATION_ERROR'));
    }

    const existe = await ParticipanteReunion.findOne({ reunionId, usuarioId });
    if (existe) {
      return res.status(409).json(err('El usuario ya es participante de esta reunión', 'CONFLICT'));
    }

    const participante = await ParticipanteReunion.create({
      reunionId,
      usuarioId,
      rol: 'participante',
    });

    const reunion = await Reunion.findById(reunionId).select('titulo');
    const mensaje = reunion
      ? `Fuiste invitado a la reunión "${reunion.titulo}".`
      : 'Tienes una nueva invitación a una reunión.';
    crearNotificacion({ usuarioId, tipo: 'invitacion', mensaje }).catch(() => {});

    res.status(201).json(ok({ participante }));
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
    const resultado = await ParticipanteReunion.findOneAndDelete({ reunionId, usuarioId, rol: 'participante' });
    if (!resultado) {
      return res.status(404).json(err('Participante no encontrado', 'NOT_FOUND'));
    }
    res.json(ok({ mensaje: 'Participante eliminado' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { agregarParticipante, listarParticipantes, eliminarParticipante };
