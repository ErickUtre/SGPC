const pool = require('../config/db');

/**
 * Obtiene las notificaciones del usuario autenticado.
 */
const obtenerMisNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.usuario?.IdUsuario;

    if (!idUsuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    const [notificaciones] = await pool.query(
      `SELECT IdNotificacion, nombreNotificacion, descripcion, leida, fechaEnvio
       FROM Notificacion
       WHERE IdDestinatario = ?
       ORDER BY fechaEnvio DESC`,
      [idUsuario]
    );

    return res.status(200).json({ ok: true, notificaciones });
  } catch (error) {
    next(error);
  }
};

/**
 * Marca una o todas las notificaciones como leídas.
 */
const marcarLeida = async (req, res, next) => {
  try {
    const idUsuario = req.usuario?.IdUsuario;
    const { idNotificacion } = req.params;

    if (!idUsuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    if (idNotificacion === 'todas') {
      await pool.query(
        'UPDATE Notificacion SET leida = TRUE WHERE IdDestinatario = ?',
        [idUsuario]
      );
    } else {
      await pool.query(
        'UPDATE Notificacion SET leida = TRUE WHERE IdNotificacion = ? AND IdDestinatario = ?',
        [Number(idNotificacion), idUsuario]
      );
    }

    return res.status(200).json({ ok: true, mensaje: 'Notificación(es) marcada(s) como leída(s).' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerMisNotificaciones,
  marcarLeida
};
