const transporter = require('../config/nodemailer');
const { EMAIL_USER } = require('../config/env');
const fs = require('fs');
const path = require('path');

const cargarTemplate = (nombre) =>
  fs.readFileSync(path.join(__dirname, '../templates', nombre), 'utf-8');

const enviarInvitacion = async ({ destinatario, nombre, reunion }) => {
  // TODO [Sarah]: implementar envío de correo de invitación
};

const enviarConfirmacion = async ({ destinatario, nombre, reunion, fechaHora }) => {
  // TODO [Sarah]: implementar envío de correo de confirmación
};

const enviarCancelacion = async ({ destinatario, nombre, reunion }) => {
  // TODO [Sarah]: implementar envío de correo de cancelación
};

module.exports = { enviarInvitacion, enviarConfirmacion, enviarCancelacion };
