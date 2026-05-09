const express = require('express');
const router = express.Router();
const { registro, login, logout, perfil, buscarUsuario } = require('../controllers/auth.controller');
const requireAuth = require('../middlewares/requireAuth');

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/perfil', requireAuth, perfil);
router.get('/usuarios', requireAuth, buscarUsuario);

module.exports = router;
