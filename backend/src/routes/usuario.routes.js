const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/usuarios/responsables
router.get('/responsables', authMiddleware, usuarioController.obtenerResponsables);

module.exports = router;
