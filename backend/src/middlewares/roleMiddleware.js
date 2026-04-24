/**
 * Middleware de autorización por rol.
 * Uso: requireRole('Supervisor', 'Contralora')
 * Debe usarse DESPUÉS de authMiddleware.
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.rol;

    if (!rolUsuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permisos para realizar esta acción.',
      });
    }

    next();
  };
};

module.exports = requireRole;
