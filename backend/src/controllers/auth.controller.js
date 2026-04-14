const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * POST /api/auth/login
 * Body: { correo: string, contrasena: string }
 */
const loginUser = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    // 1. Validar que se enviaron los campos requeridos
    if (!correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son obligatorios.',
      });
    }

    // 2. Buscar el usuario en la BD por correo
    const [rows] = await pool.query(
      'SELECT IdUsuario, nombre, correo, contrasena, rol FROM Usuario WHERE correo = ?',
      [correo.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
      });
    }

    const usuario = rows[0];

    // 3. Comparar la contraseña enviada con el hash almacenado
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
      });
    }

    // 4. Generar el JWT
    const payload = {
      IdUsuario: usuario.IdUsuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    // 5. Responder con el token y los datos del usuario (sin la contraseña)
    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.IdUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser };
