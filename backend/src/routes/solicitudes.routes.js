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

// GET  /api/solicitudes          → lista todas las solicitudes
// POST /api/solicitudes          → crea nueva solicitud (requiere auth + archivo)
router.get('/', authMiddleware, obtenerSolicitudes);
router.post('/', authMiddleware, upload.single('archivo'), crearSolicitud);
router.put('/:id/nombre', authMiddleware, actualizarNombreSolicitud);
router.put('/:id/archivo', authMiddleware, upload.single('archivo'), actualizarArchivoSolicitud);
router.post('/:id/captura-entrega', authMiddleware, uploadCaptura.single('captura'), subirCapturaEntrega);
router.post('/:id/turnar', authMiddleware, turnarSolicitud);
router.get('/:id/turnados', authMiddleware, obtenerTurnados);
router.get('/:id/archivo-pnt', authMiddleware, obtenerArchivoPNT);
router.get('/:id/captura-entrega', authMiddleware, obtenerCapturaEntrega);
router.delete('/:id', authMiddleware, eliminarSolicitud);

router.get('/:id/paquete', authMiddleware, generarPaqueteZip);
router.put('/:id/resolver', authMiddleware, resolverSolicitud);

// Rutas de evidencias de Responsables
router.post('/:id/evidencia-responsable/upload', authMiddleware, uploadPdf.single('evidencia'), subirEvidenciaResponsable);
router.get('/:id/evidencia-responsable/download', authMiddleware, obtenerEvidenciaResponsable);

// Rutas de evidencias genéricas para TI/Contralora
router.get('/:id/evidencias', authMiddleware, obtenerListaEvidencias);
router.get('/evidencia/:idEvidencia/download', authMiddleware, descargarEvidenciaPorId);

// Prórrogas
router.post('/:id/prorroga', authMiddleware, solicitarProrroga);
router.get('/:id/prorrogas', authMiddleware, obtenerPeticionesProrroga);
router.put('/:id/prorroga', authMiddleware, asignarProrroga);
router.put('/:id/cancelar', authMiddleware, cancelarSolicitud);
router.get('/:id/oficio', authMiddleware, obtenerOficioAsignado);

module.exports = router;
