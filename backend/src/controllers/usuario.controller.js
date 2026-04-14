const pool = require('../config/db');

/**
 * Obtiene todos los usuarios con el rol 'Responsable'.
 * Se ordenan por IdUsuario para mantener la consistencia solicitada.
 */
const obtenerResponsables = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdUsuario, nombre, apellidoPaterno, apellidoMaterno, correo, puesto FROM Usuario WHERE rol = "Responsable" ORDER BY IdUsuario ASC'
    );

    return res.status(200).json({
      ok: true,
      usuarios: rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerResponsables,
};
