/**
 * Middleware global de manejo de errores.
 * Captura cualquier error lanzado con next(error) en los controladores.
 * En producción: oculta detalles internos del error.
 * En desarrollo: muestra el mensaje completo.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error interno del servidor:', err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    ok: false,
    mensaje: isProduction
      ? 'Error interno del servidor. Contacta al administrador.'
      : (err.message || 'Error interno del servidor.'),
  });
};

module.exports = errorHandler;
