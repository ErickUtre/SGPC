/**
 * Middleware global de manejo de errores.
 * Captura cualquier error lanzado con next(error) en los controladores.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error interno del servidor:', err);

  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor.';

  res.status(statusCode).json({
    ok: false,
    mensaje,
  });
};

module.exports = errorHandler;
