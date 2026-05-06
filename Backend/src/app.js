const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const reunionesRoutes = require('./routes/reuniones.routes');
const participantesRoutes = require('./routes/participantes.routes');
const opcionesRoutes = require('./routes/opciones.routes');
const disponibilidadesRoutes = require('./routes/disponibilidades.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reuniones', reunionesRoutes);
app.use('/api/reuniones/:reunionId/participantes', participantesRoutes);
app.use('/api/reuniones/:reunionId/opciones', opcionesRoutes);
app.use('/api/reuniones/:reunionId/disponibilidades', disponibilidadesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use(errorHandler);

module.exports = app;
