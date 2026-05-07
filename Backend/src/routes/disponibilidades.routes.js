const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  registrarDisponibilidad, actualizarDisponibilidad, misDisponibilidades,
  resumenDisponibilidades, obtenerCoincidencias
} = require('../controllers/disponibilidades.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireOrganizador = require('../middlewares/requireOrganizador');
const requireParticipante = require('../middlewares/requireParticipante');

// /mias y /coincidencias deben ir ANTES que / para que Express no las confunda
router.get('/mias', requireAuth, requireParticipante, misDisponibilidades);
router.get('/coincidencias', requireAuth, requireOrganizador, obtenerCoincidencias);

router.post('/', requireAuth, requireParticipante, registrarDisponibilidad);
router.put('/', requireAuth, requireParticipante, actualizarDisponibilidad);
router.get('/', requireAuth, requireOrganizador, resumenDisponibilidades);

module.exports = router;
