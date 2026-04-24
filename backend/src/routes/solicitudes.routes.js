const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  obtenerSolicitudes,
  crearSolicitud,
  actualizarNombreSolicitud,
  actualizarArchivoSolicitud,
  subirCapturaEntrega,
  eliminarSolicitud,
  obtenerArchivoPNT,
  obtenerCapturaEntrega,
  turnarSolicitud,
  subirEvidenciaResponsable,
  obtenerEvidenciaResponsable,
  obtenerListaEvidencias,
  descargarEvidenciaPorId,
  solicitarProrroga,
  obtenerPeticionesProrroga,
  asignarProrroga,
  cancelarSolicitud,
  obtenerTurnados,
  generarPaqueteZip,
  resolverSolicitud,
  obtenerOficioAsignado,
} = require('../controllers/solicitudes.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

// Multer: almacenamiento en memoria (buffer directo a MySQL)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o DOCX.'));
    }
  },
});

const uploadCaptura = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG o PNG.'));
    }
  },
});

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB máximo para evidencias
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF.'));
    }
  },
});

// ─── Lectura: Cualquier usuario autenticado puede ver solicitudes ───
router.get('/', authMiddleware, obtenerSolicitudes);
router.get('/:id/archivo-pnt', authMiddleware, obtenerArchivoPNT);
router.get('/:id/captura-entrega', authMiddleware, obtenerCapturaEntrega);
router.get('/:id/turnados', authMiddleware, obtenerTurnados);
router.get('/:id/evidencias', authMiddleware, obtenerListaEvidencias);
router.get('/evidencia/:idEvidencia/download', authMiddleware, descargarEvidenciaPorId);
router.get('/:id/prorrogas', authMiddleware, obtenerPeticionesProrroga);

// ─── TI: Crear, editar, eliminar solicitudes ───
router.post('/', authMiddleware, requireRole('TI'), upload.single('archivo'), crearSolicitud);
router.put('/:id/nombre', authMiddleware, requireRole('TI'), actualizarNombreSolicitud);
router.put('/:id/archivo', authMiddleware, requireRole('TI'), upload.single('archivo'), actualizarArchivoSolicitud);
router.post('/:id/captura-entrega', authMiddleware, requireRole('TI'), uploadCaptura.single('captura'), subirCapturaEntrega);
router.delete('/:id', authMiddleware, requireRole('TI'), eliminarSolicitud);

// ─── Contralora: Turnar, cancelar, validar, asignar prórroga ───
router.post('/:id/turnar', authMiddleware, requireRole('Contralora'), turnarSolicitud);
router.put('/:id/cancelar', authMiddleware, requireRole('Contralora'), cancelarSolicitud);
router.put('/:id/resolver', authMiddleware, requireRole('Contralora'), resolverSolicitud);
router.put('/:id/prorroga', authMiddleware, requireRole('Contralora'), asignarProrroga);

// ─── Responsable: Subir evidencia, solicitar prórroga, ver oficio ───
router.post('/:id/evidencia-responsable/upload', authMiddleware, requireRole('Responsable'), uploadPdf.single('evidencia'), subirEvidenciaResponsable);
router.get('/:id/evidencia-responsable/download', authMiddleware, requireRole('Responsable'), obtenerEvidenciaResponsable);
router.post('/:id/prorroga', authMiddleware, requireRole('Responsable'), solicitarProrroga);
router.get('/:id/oficio', authMiddleware, requireRole('Responsable'), obtenerOficioAsignado);

// ─── TI y Secretaria: Generar paquete ZIP ───
router.get('/:id/paquete', authMiddleware, requireRole('TI', 'Secretaria'), generarPaqueteZip);

module.exports = router;
