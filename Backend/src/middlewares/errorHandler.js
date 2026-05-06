const { err } = require('../utils/respuesta');

const errorHandler = (error, req, res, next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json(err(error.message || 'Error interno del servidor', status));
};

module.exports = errorHandler;
