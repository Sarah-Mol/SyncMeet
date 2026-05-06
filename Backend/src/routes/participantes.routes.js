const express = require('express');
const router = express.Router({ mergeParams: true });
const { agregarParticipante, listarParticipantes, eliminarParticipante } = require('../controllers/participantes.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireOrganizador = require('../middlewares/requireOrganizador');

router.post('/', requireAuth, requireOrganizador, agregarParticipante);
router.get('/', requireAuth, listarParticipantes);
router.delete('/:usuarioId', requireAuth, requireOrganizador, eliminarParticipante);

module.exports = router;
