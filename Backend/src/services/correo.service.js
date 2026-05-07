const transporter = require('../config/nodemailer');
const { EMAIL_USER } = require('../config/env');
const fs = require('fs');
const path = require('path');

const cargarTemplate = (nombre, variables) => {
  let html = fs.readFileSync(path.join(__dirname, '../templates', nombre), 'utf-8');
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  });
  return html;
};

const enviarCorreo = async (destinatario, asunto, template, variables) => {
  try {
    const html = cargarTemplate(template, variables);
    await transporter.sendMail({
      from: `"SyncMeet" <${EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html,
    });
  } catch (error) {
    console.error(`Error al enviar correo a ${destinatario}:`, error.message);
  }
};

const enviarInvitacion = async ({ destinatario, nombre, reunion }) => {
  await enviarCorreo(
    destinatario,
    `Invitación: ${reunion.titulo}`,
    'invitacion.html',
    { nombre, titulo: reunion.titulo, descripcion: reunion.descripcion || 'Sin descripción' }
  );
};

const enviarConfirmacion = async ({ destinatario, nombre, reunion, fechaHora }) => {
  await enviarCorreo(
    destinatario,
    `Reunión confirmada: ${reunion.titulo}`,
    'confirmacion.html',
    { nombre, titulo: reunion.titulo, fechaHora }
  );
};

const enviarCancelacion = async ({ destinatario, nombre, reunion }) => {
  await enviarCorreo(
    destinatario,
    `Reunión cancelada: ${reunion.titulo}`,
    'cancelacion.html',
    { nombre, titulo: reunion.titulo }
  );
};

module.exports = { enviarInvitacion, enviarConfirmacion, enviarCancelacion };
