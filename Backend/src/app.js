const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const { FRONTEND_URL } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const reunionesRoutes = require('./routes/reuniones.routes');
const participantesRoutes = require('./routes/participantes.routes');
const opcionesRoutes = require('./routes/opciones.routes');
const disponibilidadesRoutes = require('./routes/disponibilidades.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados intentos. Espera 15 minutos.', code: 'RATE_LIMIT' },
});

app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/reuniones', reunionesRoutes);
app.use('/api/reuniones/:reunionId/participantes', participantesRoutes);
app.use('/api/reuniones/:reunionId/opciones', opcionesRoutes);
app.use('/api/reuniones/:reunionId/disponibilidades', disponibilidadesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use(errorHandler);

module.exports = app;
