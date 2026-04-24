const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 * Extrae el usuario del token Bearer y lo inyecta en req.usuario.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, mensaje: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { IdUsuario, nombre, rol, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado. Inicia sesión nuevamente.' });
  }
};

module.exports = authMiddleware;
