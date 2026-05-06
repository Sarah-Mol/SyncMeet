const express = require('express');
const router = express.Router({ mergeParams: true });
const { agregarOpcion, listarOpciones, eliminarOpcion } = require('../controllers/opciones.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireOrganizador = require('../middlewares/requireOrganizador');

router.post('/', requireAuth, requireOrganizador, agregarOpcion);
router.get('/', requireAuth, listarOpciones);
router.delete('/:opcionId', requireAuth, requireOrganizador, eliminarOpcion);

module.exports = router;
