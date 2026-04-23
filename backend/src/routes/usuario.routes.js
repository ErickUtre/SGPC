const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

// GET /api/usuarios/responsables — Contralora y TI pueden ver responsables
router.get('/responsables', authMiddleware, requireRole('Contralora', 'TI', 'Supervisor'), usuarioController.obtenerResponsables);

// Gestión de Perfil Propio (Cualquier rol autenticado)
router.get('/perfil', authMiddleware, usuarioController.obtenerMiPerfil);
router.put('/perfil', authMiddleware, usuarioController.actualizarMiPerfil);

// CRUD General de Usuarios — Solo Supervisor
router.get('/', authMiddleware, requireRole('Supervisor'), usuarioController.obtenerTodosUsuarios);
router.post('/', authMiddleware, requireRole('Supervisor'), usuarioController.crearUsuario);
router.put('/:id', authMiddleware, requireRole('Supervisor'), usuarioController.actualizarUsuario);
router.delete('/:id', authMiddleware, requireRole('Supervisor'), usuarioController.eliminarUsuario);

module.exports = router;
