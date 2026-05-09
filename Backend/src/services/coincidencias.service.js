const Disponibilidad = require('../models/Disponibilidad');

const calcularCoincidencias = async (reunionId) => {
  const disponibilidades = await Disponibilidad.find({ reunionId, disponible: true })
    .populate('opcionHorarioId');

  const mapa = {};
  for (const d of disponibilidades) {
    const opcion = d.opcionHorarioId;
    if (!opcion) continue;
    const id = opcion._id.toString();
    if (!mapa[id]) mapa[id] = { opcion, cantidad: 0 };
    mapa[id].cantidad++;
  }

  return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad);
};

module.exports = { calcularCoincidencias };
