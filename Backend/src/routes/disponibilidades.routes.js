const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  registrarDisponibilidad, actualizarDisponibilidad,
  obtenerDisponibilidades, obtenerCoincidencias
} = require('../controllers/disponibilidades.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireParticipante = require('../middlewares/requireParticipante');

router.post('/', requireAuth, requireParticipante, registrarDisponibilidad);
router.put('/:disponibilidadId', requireAuth, requireParticipante, actualizarDisponibilidad);
router.get('/', requireAuth, obtenerDisponibilidades);
router.get('/coincidencias', requireAuth, obtenerCoincidencias);

module.exports = router;
