require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const solicitudesRoutes = require('./src/routes/solicitudes.routes');
const usuarioRoutes = require('./src/routes/usuario.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors()); // Permitir todos los orígenes para desarrollo local

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de health-check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`\n🚀 Servidor SGPC corriendo en http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   BD: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
});
