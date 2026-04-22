const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Obtener notificaciones del usuario actual
router.get('/', notificacionesController.obtenerMisNotificaciones);

// Marcar notificación como leída (o 'todas')
router.put('/:idNotificacion/leer', notificacionesController.marcarLeida);

module.exports = router;
