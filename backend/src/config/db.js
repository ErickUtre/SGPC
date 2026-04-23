const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'sgpc_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: true,
  charset: 'utf8mb4',
});

// Verificar conexión al arrancar con reintentos automáticos
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(attempt = 1) {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ Conectado a MySQL (intento ${attempt})`);
    conn.release();
  } catch (err) {
    console.error(`⏳ Intento ${attempt}/${MAX_RETRIES} - MySQL no disponible: ${err.message}`);
    if (attempt < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      return connectWithRetry(attempt + 1);
    } else {
      console.error('❌ No se pudo conectar con MySQL después de múltiples intentos.');
      console.error('   Verifica que el contenedor Docker esté corriendo: docker compose up -d');
    }
  }
}

connectWithRetry();

module.exports = pool;
