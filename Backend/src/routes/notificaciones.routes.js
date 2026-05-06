const express = require('express');
const router = express.Router();
const { obtenerNotificaciones, marcarLeida } = require('../controllers/notificaciones.controller');
const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, obtenerNotificaciones);
router.put('/:id/leida', requireAuth, marcarLeida);

module.exports = router;
