/**
 * Script de migración: hashea contraseñas en texto plano con bcrypt.
 * Ejecutar UNA SOLA VEZ: node scripts/hashPasswords.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

async function hashPasswords() {
  let connection;

  try {
    console.log('\n🔐 Iniciando migración de contraseñas...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'sgpc_db',
    });

    // Obtener todos los usuarios
    const [usuarios] = await connection.query(
      'SELECT IdUsuario, nombre, correo, contrasena FROM Usuario'
    );

    if (usuarios.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la base de datos.');
      return;
    }

    console.log(`   Usuarios encontrados: ${usuarios.length}\n`);

    let migrados = 0;
    let omitidos = 0;

    for (const usuario of usuarios) {
      const { IdUsuario, nombre, correo, contrasena } = usuario;

      // Detectar si la contraseña ya está hasheada con bcrypt
      // Los hashes bcrypt siempre empiezan con "$2a$", "$2b$" o "$2y$"
      const yaHasheada = contrasena.startsWith('$2a$') ||
                         contrasena.startsWith('$2b$') ||
                         contrasena.startsWith('$2y$');

      if (yaHasheada) {
        console.log(`   ⏭️  Omitiendo [${correo}] — contraseña ya hasheada.`);
        omitidos++;
        continue;
      }

      // Hashear la contraseña
      const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

      // Actualizar en la BD
      await connection.query(
        'UPDATE Usuario SET contrasena = ? WHERE IdUsuario = ?',
        [hash, IdUsuario]
      );

      console.log(`   ✅ [${correo}] (${nombre}) — contraseña hasheada correctamente.`);
      migrados++;
    }

    console.log(`\n────────────────────────────────────`);
    console.log(`   Migración completada.`);
    console.log(`   ✅ Hasheadas: ${migrados}`);
    console.log(`   ⏭️  Omitidas:  ${omitidos}`);
    console.log(`────────────────────────────────────\n`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('   Asegúrate de que Docker esté corriendo: docker compose up -d\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

hashPasswords();
