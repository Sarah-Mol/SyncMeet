const Disponibilidad = require('../models/Disponibilidad');
const ParticipanteReunion = require('../models/ParticipanteReunion');
const OpcionHorario = require('../models/OpcionHorario');

const calcularCoincidencias = async (reunionId) => {
  const opciones = await OpcionHorario.find({ reunionId });

  const participantes = await ParticipanteReunion.find({ reunionId, rol: 'participante' })
    .populate('usuarioId', 'nombre email');

  const disponibilidades = await Disponibilidad.find({ reunionId });

  const resultado = opciones.map(opcion => {
    const respuestas = disponibilidades.filter(
      d => d.opcionHorarioId.toString() === opcion._id.toString()
    );

    const disponibles = respuestas
      .filter(d => d.disponible === true)
      .map(d => d.participanteId.toString());

    const respondieron = respuestas.map(d => d.participanteId.toString());

    const participantesDisponibles = participantes
      .filter(p => disponibles.includes(p.usuarioId._id.toString()))
      .map(p => ({ nombre: p.usuarioId.nombre, email: p.usuarioId.email }));

    const participantesPendientes = participantes
      .filter(p => !respondieron.includes(p.usuarioId._id.toString()))
      .map(p => ({ nombre: p.usuarioId.nombre, email: p.usuarioId.email }));

    return {
      opcionHorarioId: opcion._id,
      fechaHora: opcion.fechaHora,
      totalDisponibles: participantesDisponibles.length,
      participantes: participantesDisponibles,
      pendienteRespuesta: participantesPendientes,
    };
  });

  resultado.sort((a, b) => b.totalDisponibles - a.totalDisponibles);

  return resultado;
};

module.exports = { calcularCoincidencias };
