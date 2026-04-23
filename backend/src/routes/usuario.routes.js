const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/usuarios/responsables
router.get('/responsables', authMiddleware, usuarioController.obtenerResponsables);

// Gestión de Perfil Propio (Cualquier rol autenticado, puesto antes del /:id para evitar choque de rutas)
router.get('/perfil', authMiddleware, usuarioController.obtenerMiPerfil);
router.put('/perfil', authMiddleware, usuarioController.actualizarMiPerfil);

// CRUD General de Usuarios (Solo Supervisor debería acceder a esto, controlado en frontend/backend)
router.get('/', authMiddleware, usuarioController.obtenerTodosUsuarios);
router.post('/', authMiddleware, usuarioController.crearUsuario);
router.put('/:id', authMiddleware, usuarioController.actualizarUsuario);
router.delete('/:id', authMiddleware, usuarioController.eliminarUsuario);

module.exports = router;
