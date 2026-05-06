const express = require('express');
const router = express.Router();
const {
  crearReunion, obtenerReuniones, obtenerReunion,
  editarReunion, confirmarReunion, cancelarReunion
} = require('../controllers/reuniones.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireOrganizador = require('../middlewares/requireOrganizador');

router.post('/', requireAuth, crearReunion);
router.get('/', requireAuth, obtenerReuniones);
router.get('/:id', requireAuth, obtenerReunion);
router.put('/:id', requireAuth, requireOrganizador, editarReunion);
router.post('/:id/confirmar', requireAuth, requireOrganizador, confirmarReunion);
router.post('/:id/cancelar', requireAuth, requireOrganizador, cancelarReunion);

module.exports = router;
