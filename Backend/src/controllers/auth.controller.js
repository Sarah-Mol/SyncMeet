const { ok, err } = require('../utils/respuesta');

const registro = async (req, res, next) => {
  try {
    // TODO [Sarah]: implementar registro de usuario
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // TODO [Sarah]: implementar login y generación de JWT
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // TODO [Sarah]: implementar logout
    res.json(ok({ mensaje: 'Sesión cerrada' }));
  } catch (error) {
    next(error);
  }
};

const perfil = async (req, res, next) => {
  try {
    // TODO [Sarah]: retornar datos del usuario autenticado
    res.json(ok({}));
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, logout, perfil };
