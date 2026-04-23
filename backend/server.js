require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');
const usuarioRoutes = require('./src/routes/usuario.routes');
const notificacionesRoutes = require('./src/routes/notificaciones.routes');
const errorHandler = require('./src/middlewares/errorHandler');
const sanitize = require('./src/middlewares/sanitize');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Headers de Seguridad HTTP ───
app.use(helmet());

// ─── CORS ───
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl, health-check)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Bloqueado por CORS'));
  },
  credentials: true,
}));

// ─── Rate Limiting Global ───
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100,                 // máx 100 peticiones por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiadas peticiones. Intenta de nuevo en un minuto.' },
});
app.use(globalLimiter);

// ─── Rate Limiting para Login (anti fuerza bruta) ───
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máx 10 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
});

// ─── Body Parser ───
app.use(express.json({ limit: '1mb' }));

// ─── Sanitización Global de Inputs ───
app.use(sanitize);

// ─── Rutas ───
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta de health-check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor SGPC corriendo en http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   BD: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`   CORS: ${allowedOrigins.join(', ')}\n`);
});
