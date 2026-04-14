const pool = require('../config/db');
const AdmZip = require('adm-zip');
const { generarOficioPDF } = require('../utils/oficioGenerator');
const path = require('path');

// ── Helpers ────────────────────────────────────────────────────────────────

/** Formatea un Date string (UTC de MySQL) a "DD/MM/YYYY" en CST (UTC-6) */
const formatFecha = (dateStr) => {
  if (!dateStr) return '—';
  // MySQL con dateStrings:true devuelve "YYYY-MM-DD HH:MM:SS"
  // Forzamos interpretación como UTC agregando 'Z'
  const d = new Date(dateStr + ' Z');
  if (isNaN(d.getTime())) return '—';
  
  // Restar 6 horas para CST (UTC-6)
  const cst = new Date(d.getTime() - (6 * 60 * 60 * 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(cst.getUTCDate())}/${pad(cst.getUTCMonth() + 1)}/${cst.getUTCFullYear()}`;
};

/** Formatea un Date string (UTC de MySQL) a "HH:MM AM/PM" en CST (UTC-6) */
const formatHora = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + ' Z');
  if (isNaN(d.getTime())) return '—';

  // Restar 6 horas para CST (UTC-6)
  const cst = new Date(d.getTime() - (6 * 60 * 60 * 1000));
  let h = cst.getUTCHours();
  const min = String(cst.getUTCMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${min} ${ampm}`;
};

/** Genera el folio UV-TR-YYYY-NNN partiendo del IdSolicitud */
const generarFolio = (id, anio) => {
  return `UV-TR-${anio}-${String(id).padStart(3, '0')}`;
};

const inferMimeType = (nombreArchivo = '') => {
  const ext = path.extname(nombreArchivo).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === '.doc') return 'application/msword';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};

/** 
 * Corrige la codificación del nombre del archivo.
 * Multer a veces interpreta los nombres UTF-8 como Latin1.
 */
const fixFilenameEncoding = (filename) => {
  if (!filename) return filename;
  try {
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch (e) {
    return filename;
  }
};


// ── GET /api/solicitudes ───────────────────────────────────────────────────
/**
 * Devuelve todas las solicitudes con el formato esperado por el frontend.
 */
const obtenerSolicitudes = async (req, res, next) => {
  try {
    const rol = req.usuario?.rol;
    const idUsuario = req.usuario?.IdUsuario;

    let query = `
      SELECT 
        s.IdSolicitud,
        s.nombreSolicitud,
        s.resuelto,
        s.IdCapturaEntrega,
        s.fechaRegistro,
        s.folio,
        s.diasMaximos,
        a.nombreArchivo,
        (SELECT COUNT(*) FROM TurnadoSolicitud ts WHERE ts.IdSolicitud = s.IdSolicitud) > 0 AS asignada,
        (SELECT COUNT(*) FROM EvidenciaResponsable er 
         INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta 
         WHERE r.IdSolicitud = s.IdSolicitud AND er.IdUsuarioResponsable = ?) > 0 AS evidenciaSubida,
        s.diasProrroga,
        s.cancelada,
        (SELECT COUNT(*) FROM ProrrogaSolicitud ps WHERE ps.IdSolicitud = s.IdSolicitud) AS solicitudesProrrogaCount,
        (SELECT COUNT(*) FROM ProrrogaSolicitud ps2 WHERE ps2.IdSolicitud = s.IdSolicitud AND ps2.IdUsuarioResponsable = ?) > 0 AS yaSolicitoProrroga
      FROM Solicitud s
      LEFT JOIN Archivo a ON s.IdArchivoPNT = a.IdArchivo
    `;

    const queryParams = [idUsuario || 0, idUsuario || 0];
    let whereConditions = [];

    // Lógica de filtrado por rol
    if (rol === 'Responsable') {
      query += ` INNER JOIN TurnadoSolicitud ts ON s.IdSolicitud = ts.IdSolicitud `;
      whereConditions.push(`ts.IdUsuarioResponsable = ?`);
      queryParams.push(idUsuario);
    }

    if (rol === 'Secretaria') {
      // Solo ve solicitudes con captura de entrega y al menos una respuesta
      whereConditions.push(`s.IdCapturaEntrega IS NOT NULL`);
      whereConditions.push(`(SELECT COUNT(*) 
                             FROM EvidenciaResponsable er3 
                             INNER JOIN Respuesta r3 ON er3.IdRespuesta = r3.IdRespuesta 
                             WHERE r3.IdSolicitud = s.IdSolicitud) > 0`);
      whereConditions.push(`s.cancelada = FALSE`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

    query += ' ORDER BY s.fechaRegistro DESC';

    const [rows] = await pool.query(query, queryParams);

    const solicitudes = rows.map((row) => {
      // row.fechaRegistro es string por dateStrings:true
      const fechaBase = row.fechaRegistro;
      return {
        id: row.IdSolicitud,
        nombre: row.nombreSolicitud,
        archivo: row.nombreArchivo || '—',
        folio: row.folio || generarFolio(row.IdSolicitud, new Date(fechaBase).getFullYear()),
        diasMaximos: row.diasMaximos || 7,
        fecha: formatFecha(fechaBase),
        hora: formatHora(fechaBase),
        resuelto: !!row.resuelto,
        capturaEntregaDisponible: !!row.IdCapturaEntrega,
        asignada: !!row.asignada,
        evidenciaSubida: !!row.evidenciaSubida,
        diasProrroga: row.diasProrroga || 0,
        solicitudesProrrogaCount: row.solicitudesProrrogaCount || 0,
        yaSolicitoProrroga: !!row.yaSolicitoProrroga,
        cancelada: !!row.cancelada,
        validada: !!row.resuelto,
        paqueteGenerado: false,
      };
    });

    return res.status(200).json({ ok: true, solicitudes });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/archivo-pnt ───────────────────────────────────
const obtenerArchivoPNT = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido
       FROM Solicitud s
       INNER JOIN Archivo a ON s.IdArchivoPNT = a.IdArchivo
       WHERE s.IdSolicitud = ?`,
      [idSolicitud]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Archivo de solicitud no encontrado.' });
    }

    const archivo = rows[0];
    res.setHeader('Content-Type', inferMimeType(archivo.nombreArchivo));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(archivo.nombreArchivo)}"`);
    return res.status(200).send(archivo.contenido);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/captura-entrega ───────────────────────────────
const obtenerCapturaEntrega = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido
       FROM Solicitud s
       INNER JOIN Archivo a ON s.IdCapturaEntrega = a.IdArchivo
       WHERE s.IdSolicitud = ?`,
      [idSolicitud]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Captura de entrega no encontrada.' });
    }

    const archivo = rows[0];
    res.setHeader('Content-Type', inferMimeType(archivo.nombreArchivo));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(archivo.nombreArchivo)}"`);
    return res.status(200).send(archivo.contenido);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/solicitudes ──────────────────────────────────────────────────
/**
 * Crea una nueva solicitud.
 * Body (multipart/form-data):
 *   - nombre: string  — nombre de la solicitud
 *   - archivo: File   — archivo PNT (PDF/DOCX)
 * Header: Authorization: Bearer <JWT>   (IdUsuario extraído del token)
 */
const crearSolicitud = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { nombre, folio, diasMaximos } = req.body;
    const archivo = req.file;

    console.log('[DEBUG] crearSolicitud - Body:', req.body);
    console.log('[DEBUG] crearSolicitud - File:', archivo ? archivo.originalname : 'No file');
    console.log('[DEBUG] crearSolicitud - IdUsuarioTI:', req.usuario?.IdUsuario);

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ ok: false, mensaje: 'El nombre de la solicitud es obligatorio.' });
    }
    if (!archivo) {
      return res.status(400).json({ ok: false, mensaje: 'Debe adjuntar un archivo (PDF o DOCX).' });
    }
    if (!folio || folio.trim().length !== 15 || !/^\d+$/.test(folio)) {
      return res.status(400).json({ ok: false, mensaje: 'El folio debe tener exactamente 15 caracteres numéricos.' });
    }
    const dias = parseInt(diasMaximos, 10);
    if (isNaN(dias) || dias < 1 || dias > 100) {
      return res.status(400).json({ ok: false, mensaje: 'Los días máximos deben ser un número entre 1 y 100.' });
    }

    // Obtener IdUsuario del token (inyectado por el middleware authMiddleware)
    const idUsuarioTI = req.usuario?.IdUsuario;
    if (!idUsuarioTI) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    await conn.beginTransaction();

    // 1. Insertar archivo en tabla Archivo
    const [archivoResult] = await conn.query(
      'INSERT INTO Archivo (nombreArchivo, contenido) VALUES (?, ?)',
      [fixFilenameEncoding(archivo.originalname), archivo.buffer]
    );
    const idArchivo = archivoResult.insertId;

    // 2. Insertar solicitud en tabla Solicitud
    const [solicitudResult] = await conn.query(
      `INSERT INTO Solicitud (nombreSolicitud, resuelto, IdUsuarioTI, IdArchivoPNT, folio, diasMaximos)
       VALUES (?, false, ?, ?, ?, ?)`,
      [nombre.trim(), idUsuarioTI, idArchivo, folio.trim(), dias]
    );
    const idSolicitud = solicitudResult.insertId;

    await conn.commit();

    // 3. Leer el registro recién creado para obtener la fechaRegistro real de la BD
    const [[nuevaSolicitud]] = await conn.query(
      `SELECT s.IdSolicitud, s.nombreSolicitud, s.resuelto, s.fechaRegistro, s.folio, s.diasMaximos, a.nombreArchivo
       FROM Solicitud s
       LEFT JOIN Archivo a ON s.IdArchivoPNT = a.IdArchivo
       WHERE s.IdSolicitud = ?`,
      [idSolicitud]
    );

    const fechaBase = nuevaSolicitud.fechaRegistro;

    return res.status(201).json({
      ok: true,
      mensaje: 'Solicitud registrada exitosamente.',
      solicitud: {
        id: nuevaSolicitud.IdSolicitud,
        nombre: nuevaSolicitud.nombreSolicitud,
        archivo: nuevaSolicitud.nombreArchivo,
        folio: nuevaSolicitud.folio,
        diasMaximos: nuevaSolicitud.diasMaximos,
        fecha: formatFecha(fechaBase),
        hora: formatHora(fechaBase),
        resuelto: false,
        asignada: false,
        validada: false,
        paqueteGenerado: false,
      },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// ── PUT /api/solicitudes/:id/nombre ────────────────────────────────────────
const actualizarNombreSolicitud = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    const { nombre } = req.body;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio.' });
    }

    const [result] = await pool.query(
      'UPDATE Solicitud SET nombreSolicitud = ? WHERE IdSolicitud = ?',
      [nombre.trim(), idSolicitud]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }

    return res.status(200).json({ ok: true, mensaje: 'Nombre actualizado correctamente.' });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/solicitudes/:id/archivo ───────────────────────────────────────
const actualizarArchivoSolicitud = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);
    const archivo = req.file;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!archivo) {
      return res.status(400).json({ ok: false, mensaje: 'Debe adjuntar un archivo (PDF o DOCX).' });
    }

    await conn.beginTransaction();

    const [archivoResult] = await conn.query(
      'INSERT INTO Archivo (nombreArchivo, contenido) VALUES (?, ?)',
      [fixFilenameEncoding(archivo.originalname), archivo.buffer]
    );
    const idArchivoNuevo = archivoResult.insertId;

    const [updateResult] = await conn.query(
      'UPDATE Solicitud SET IdArchivoPNT = ? WHERE IdSolicitud = ?',
      [idArchivoNuevo, idSolicitud]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Archivo de solicitud actualizado correctamente.' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// ── POST /api/solicitudes/:id/captura-entrega ──────────────────────────────
const subirCapturaEntrega = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);
    const captura = req.file;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!captura) {
      return res.status(400).json({ ok: false, mensaje: 'Debe adjuntar una imagen (JPG o PNG).' });
    }

    await conn.beginTransaction();

    const [archivoResult] = await conn.query(
      'INSERT INTO Archivo (nombreArchivo, contenido) VALUES (?, ?)',
      [fixFilenameEncoding(captura.originalname), captura.buffer]
    );
    const idCaptura = archivoResult.insertId;

    const [updateResult] = await conn.query(
      'UPDATE Solicitud SET IdCapturaEntrega = ? WHERE IdSolicitud = ?',
      [idCaptura, idSolicitud]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Captura de entrega registrada correctamente.' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

const eliminarSolicitud = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    await conn.beginTransaction();

    // 1. Recolectar todos los IdArchivo asociados para limpiar la tabla Archivo
    const [sol] = await conn.query('SELECT IdArchivoPNT, IdCapturaEntrega FROM Solicitud WHERE IdSolicitud = ?', [idSolicitud]);
    
    if (sol.length === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }

    const idsArchivos = [];
    if (sol[0].IdArchivoPNT) idsArchivos.push(sol[0].IdArchivoPNT);
    if (sol[0].IdCapturaEntrega) idsArchivos.push(sol[0].IdCapturaEntrega);

    // De los turnados
    const [turnados] = await conn.query('SELECT IdArchivoOficio FROM TurnadoSolicitud WHERE IdSolicitud = ?', [idSolicitud]);
    turnados.forEach(t => { if (t.IdArchivoOficio) idsArchivos.push(t.IdArchivoOficio); });

    // De las evidencias de responsables
    const [evidencias] = await conn.query(
      `SELECT er.IdArchivoRespuesta 
       FROM EvidenciaResponsable er
       INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta
       WHERE r.IdSolicitud = ?`,
      [idSolicitud]
    );
    evidencias.forEach(e => { if (e.IdArchivoRespuesta) idsArchivos.push(e.IdArchivoRespuesta); });

    // 2. Eliminación de registros en cascada manual
    await conn.query('DELETE FROM EvidenciaResponsable WHERE IdRespuesta IN (SELECT IdRespuesta FROM Respuesta WHERE IdSolicitud = ?)', [idSolicitud]);
    await conn.query('DELETE FROM Respuesta WHERE IdSolicitud = ?', [idSolicitud]);
    await conn.query('DELETE FROM TurnadoSolicitud WHERE IdSolicitud = ?', [idSolicitud]);
    await conn.query('DELETE FROM ProrrogaSolicitud WHERE IdSolicitud = ?', [idSolicitud]);
    await conn.query('DELETE FROM Solicitud WHERE IdSolicitud = ?', [idSolicitud]);

    // 3. Eliminar los archivos binarios de la tabla central Archivo
    if (idsArchivos.length > 0) {
      const uniqueIds = [...new Set(idsArchivos)];
      await conn.query('DELETE FROM Archivo WHERE IdArchivo IN (?)', [uniqueIds]);
    }

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Solicitud y todos sus registros relacionados eliminados permanentemente.' });

  } catch (error) {
    if (conn) await conn.rollback();
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

// ── POST /api/solicitudes/:id/turnar ─────────────────────────────────────────
/**
 * Asigna (turna) una solicitud a uno o más responsables.
 * Body: { idsResponsables: number[] }
 */
const turnarSolicitud = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);
    const { idsResponsables } = req.body;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!Array.isArray(idsResponsables) || idsResponsables.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Debe seleccionar al menos un responsable.' });
    }

    await conn.beginTransaction();

    // 0. Limpiar evidencias y respuestas previas (según requerimiento de reasignación)
    const [evidencias] = await conn.query(
      `SELECT er.IdArchivoRespuesta 
       FROM EvidenciaResponsable er
       INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta
       WHERE r.IdSolicitud = ?`,
       [idSolicitud]
    );

    if (evidencias.length > 0) {
      const idsArchivos = evidencias.map(e => e.IdArchivoRespuesta);
      // Borrar relaciones de evidencia
      await conn.query(
        `DELETE er FROM EvidenciaResponsable er
         INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta
         WHERE r.IdSolicitud = ?`,
        [idSolicitud]
      );
      // Borrar respuestas
      await conn.query('DELETE FROM Respuesta WHERE IdSolicitud = ?', [idSolicitud]);
      // Borrar contenido binario
      await conn.query('DELETE FROM Archivo WHERE IdArchivo IN (?)', [idsArchivos]);
    }

    // 1. Limpiar turnados anteriores (y sus archivos de oficio)
    const [oficiosViejos] = await conn.query('SELECT IdArchivoOficio FROM TurnadoSolicitud WHERE IdSolicitud = ?', [idSolicitud]);
    const idsViejos = oficiosViejos.map(o => o.IdArchivoOficio).filter(id => id !== null);
    
    await conn.query('DELETE FROM TurnadoSolicitud WHERE IdSolicitud = ?', [idSolicitud]);
    if (idsViejos.length > 0) {
      await conn.query('DELETE FROM Archivo WHERE IdArchivo IN (?)', [idsViejos]);
    }

    // 2. Obtener datos de la solicitud para el oficio
    const [solRows] = await conn.query('SELECT folio, fechaRegistro, diasMaximos FROM Solicitud WHERE IdSolicitud = ?', [idSolicitud]);
    const solicitud = solRows[0];

    // 3. Generar oficio e insertar para cada responsable
    for (const idResp of idsResponsables) {
      const [userRows] = await conn.query('SELECT * FROM Usuario WHERE IdUsuario = ?', [idResp]);
      const user = userRows[0];

      // Generar el PDF
      const pdfBuffer = await generarOficioPDF({
        solicitudFolio: solicitud.folio,
        solicitudFechaRegistro: solicitud.fechaRegistro,
        solicitudDiasMaximos: solicitud.diasMaximos,
        responsableNombre: user.nombre,
        responsableApellidoPaterno: user.apellidoPaterno,
        responsableApellidoMaterno: user.apellidoMaterno,
        responsableAbreviacion: user.abreviacionOcupacion,
        responsablePuesto: user.puesto,
        responsableOcupacion: user.ocupacion
      });

      // Guardar PDF en la tabla Archivo
      const nombreArchivoOficio = `Oficio_${solicitud.folio}_${user.apellidoPaterno}.pdf`;
      const [archivoResult] = await conn.query(
        'INSERT INTO Archivo (nombreArchivo, contenido) VALUES (?, ?)',
        [nombreArchivoOficio, pdfBuffer]
      );
      const idArchivoOficio = archivoResult.insertId;

      // Crear el registro de turnado vinculado al oficio
      await conn.query(
        'INSERT INTO TurnadoSolicitud (IdSolicitud, IdUsuarioResponsable, IdArchivoOficio) VALUES (?, ?, ?)',
        [idSolicitud, idResp, idArchivoOficio]
      );
    }

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Solicitud turnada y oficios generados correctamente.' });

  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// ── POST /api/solicitudes/:id/evidencia-responsable ─────────────────────────────────────────
const subirEvidenciaResponsable = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);
    const idUsuario = req.usuario?.IdUsuario;
    const archivo = req.file;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!archivo) {
      return res.status(400).json({ ok: false, mensaje: 'Debe adjuntar un archivo PDF.' });
    }
    if (!idUsuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }

    await conn.beginTransaction();

    // 1. Verificar si ya existe una Respuesta para esta solicitud
    let idRespuesta;
    const [respuestas] = await conn.query('SELECT IdRespuesta FROM Respuesta WHERE IdSolicitud = ?', [idSolicitud]);
    
    if (respuestas.length === 0) {
      // Crear respuesta generica inicial si no existe
      const [insertResp] = await conn.query('INSERT INTO Respuesta (IdSolicitud, completa) VALUES (?, false)', [idSolicitud]);
      idRespuesta = insertResp.insertId;
    } else {
      idRespuesta = respuestas[0].IdRespuesta;
    }

    // 2. Guardar el archivo pdf
    const [archivoResult] = await conn.query(
      'INSERT INTO Archivo (nombreArchivo, contenido) VALUES (?, ?)',
      [fixFilenameEncoding(archivo.originalname), archivo.buffer]
    );
    const idArchivo = archivoResult.insertId;

    // 3. Verificar si el Responsable ya había subido evidencia
    const [evidencias] = await conn.query(
      'SELECT IdEvidencia, IdArchivoRespuesta FROM EvidenciaResponsable WHERE IdRespuesta = ? AND IdUsuarioResponsable = ?',
      [idRespuesta, idUsuario]
    );

    if (evidencias.length > 0) {
      // Actualizar archivo y eliminar el anterior para no dejar basura si se desea, por ahora actualizamos foreign key
      await conn.query('UPDATE EvidenciaResponsable SET IdArchivoRespuesta = ? WHERE IdEvidencia = ?', [idArchivo, evidencias[0].IdEvidencia]);
    } else {
      // Insertar nueva evidencia
      await conn.query(
        'INSERT INTO EvidenciaResponsable (IdRespuesta, IdUsuarioResponsable, IdArchivoRespuesta) VALUES (?, ?, ?)',
        [idRespuesta, idUsuario, idArchivo]
      );
    }

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Evidencia registrada correctamente.' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// ── GET /api/solicitudes/:id/evidencia-responsable ─────────────────────────────────────────
const obtenerEvidenciaResponsable = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    const idUsuario = req.usuario?.IdUsuario;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido 
       FROM EvidenciaResponsable er
       INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta
       INNER JOIN Archivo a ON er.IdArchivoRespuesta = a.IdArchivo
       WHERE r.IdSolicitud = ? AND er.IdUsuarioResponsable = ?`,
      [idSolicitud, idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No hay evidencia registrada por este responsable.' });
    }

    const archivo = rows[0];
    res.setHeader('Content-Type', inferMimeType(archivo.nombreArchivo));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(archivo.nombreArchivo)}"`);
    return res.status(200).send(archivo.contenido);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/evidencias ─────────────────────────────────────────
const obtenerListaEvidencias = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT 
         ts.IdUsuarioResponsable, 
         u.nombre AS nombreResponsable, 
         er.IdEvidencia,
         a.nombreArchivo 
       FROM TurnadoSolicitud ts
       INNER JOIN Usuario u ON ts.IdUsuarioResponsable = u.IdUsuario
       LEFT JOIN Respuesta r ON r.IdSolicitud = ts.IdSolicitud
       LEFT JOIN EvidenciaResponsable er ON (er.IdRespuesta = r.IdRespuesta AND er.IdUsuarioResponsable = ts.IdUsuarioResponsable)
       LEFT JOIN Archivo a ON er.IdArchivoRespuesta = a.IdArchivo
       WHERE ts.IdSolicitud = ?
       ORDER BY u.nombre ASC`,
      [idSolicitud]
    );

    return res.status(200).json({ ok: true, evidencias: rows });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/evidencia/:idEvidencia/download ───────────────────────
const descargarEvidenciaPorId = async (req, res, next) => {
  try {
    const idEvidencia = Number(req.params.idEvidencia);

    if (!Number.isInteger(idEvidencia) || idEvidencia <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de evidencia inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido 
       FROM EvidenciaResponsable er
       INNER JOIN Archivo a ON er.IdArchivoRespuesta = a.IdArchivo
       WHERE er.IdEvidencia = ?`,
      [idEvidencia]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Evidencia no encontrada.' });
    }

    const archivo = rows[0];
    res.setHeader('Content-Type', inferMimeType(archivo.nombreArchivo));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(archivo.nombreArchivo)}"`);
    return res.status(200).send(archivo.contenido);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/solicitudes/:id/prorroga ───────────────────────────────────────
const solicitarProrroga = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    const idUsuario = req.usuario?.IdUsuario;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    // Insertar en la tabla de petición
    await pool.query(
      'INSERT INTO ProrrogaSolicitud (IdSolicitud, IdUsuarioResponsable) VALUES (?, ?)',
      [idSolicitud, idUsuario]
    );

    return res.status(200).json({ ok: true, mensaje: 'Prórroga solicitada con éxito.' });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/prorrogas ────────────────────────────────────────
const obtenerPeticionesProrroga = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT ps.IdProrroga, u.nombre, ps.fechaSolicitud 
       FROM ProrrogaSolicitud ps
       INNER JOIN Usuario u ON ps.IdUsuarioResponsable = u.IdUsuario
       WHERE ps.IdSolicitud = ?
       ORDER BY ps.fechaSolicitud ASC`,
      [idSolicitud]
    );

    return res.status(200).json({ ok: true, peticiones: rows });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/solicitudes/:id/prorroga ─────────────────────────────────────────
const asignarProrroga = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const idSolicitud = Number(req.params.id);
    const { dias } = req.body;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }
    if (!Number.isInteger(dias) || dias <= 0 || dias > 100) {
      return res.status(400).json({ ok: false, mensaje: 'La cantidad de días debe ser entre 1 y 100.' });
    }

    await conn.beginTransaction();

    // Actualizamos el límite extendiéndolo
    await conn.query('UPDATE Solicitud SET diasProrroga = diasProrroga + ? WHERE IdSolicitud = ?', [dias, idSolicitud]);

    // Limpiamos la lista de alertas para esta solicitud
    await conn.query('DELETE FROM ProrrogaSolicitud WHERE IdSolicitud = ?', [idSolicitud]);

    await conn.commit();
    return res.status(200).json({ ok: true, mensaje: 'Prórroga asignada y notificaciones limpiadas.' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// ── PUT /api/solicitudes/:id/cancelar ───────────────────────────────────────
const cancelarSolicitud = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    await pool.query('UPDATE Solicitud SET cancelada = TRUE WHERE IdSolicitud = ?', [idSolicitud]);

    return res.status(200).json({ ok: true, mensaje: 'Solicitud cancelada con éxito.' });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/turnados ────────────────────────────────────────
const obtenerTurnados = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      'SELECT IdUsuarioResponsable FROM TurnadoSolicitud WHERE IdSolicitud = ?',
      [idSolicitud]
    );

    const ids = rows.map(r => r.IdUsuarioResponsable);
    return res.status(200).json({ ok: true, turnados: ids });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/paquete ────────────────────────────────────────
const generarPaqueteZip = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    // 1. Obtener datos de la solicitud y sus archivos principales
    const [solRows] = await pool.query(
      `SELECT s.nombreSolicitud,
              aPNT.nombreArchivo AS nombrePNT, aPNT.contenido AS contenidoPNT,
              aCaptura.nombreArchivo AS nombreCaptura, aCaptura.contenido AS contenidoCaptura
       FROM Solicitud s
       LEFT JOIN Archivo aPNT ON s.IdArchivoPNT = aPNT.IdArchivo
       LEFT JOIN Archivo aCaptura ON s.IdCapturaEntrega = aCaptura.IdArchivo
       WHERE s.IdSolicitud = ?`,
       [idSolicitud]
    );

    if (solRows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }

    const solicitud = solRows[0];
    const zip = new AdmZip();

    // 2. Carpeta "Solicitud"
    if (solicitud.contenidoPNT) {
      zip.addFile(`Solicitud/${solicitud.nombrePNT}`, solicitud.contenidoPNT);
    } else {
      zip.addFile(`Solicitud/leeme.txt`, Buffer.from('No se encontró el archivo de la solicitud original.'));
    }

    // 3. Carpeta "Oficios turnados"
    zip.addFile(`Oficios turnados/`, Buffer.alloc(0));

    // 4. Carpeta "Respuesta" (evidencias de responsables)
    const [evidencias] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido, u.nombre AS nombreResponsable
       FROM EvidenciaResponsable er
       INNER JOIN Respuesta r ON er.IdRespuesta = r.IdRespuesta
       INNER JOIN Archivo a ON er.IdArchivoRespuesta = a.IdArchivo
       INNER JOIN Usuario u ON er.IdUsuarioResponsable = u.IdUsuario
       WHERE r.IdSolicitud = ?`,
       [idSolicitud]
    );

    if (evidencias.length > 0) {
      evidencias.forEach(ev => {
        const ext = ev.nombreArchivo.split('.').pop();
        const base = ev.nombreArchivo.replace(`.${ext}`, '');
        // Sanitizar nombre de responsable para el sistema de archivos
        const respNameSafe = ev.nombreResponsable.replace(/[^a-z0-9]/gi, '_');
        const nombreFinal = `${base}_${respNameSafe}.${ext}`;
        zip.addFile(`Respuesta/${nombreFinal}`, ev.contenido);
      });
    } else {
       zip.addFile(`Respuesta/leeme.txt`, Buffer.from('Aún no hay respuestas de los responsables.'));
    }

    // 5. Carpeta "Captura de evidencia de entrega"
    if (solicitud.contenidoCaptura) {
      zip.addFile(`Captura de evidencia de entrega/${solicitud.nombreCaptura}`, solicitud.contenidoCaptura);
    } else {
      zip.addFile(`Captura de evidencia de entrega/leeme.txt`, Buffer.from('No se ha subido captura de evidencia de entrega.'));
    }

    const zipBuffer = zip.toBuffer();
    const nombreZip = `Paquete_Solicitud_${idSolicitud}.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${nombreZip}"`,
      'Content-Length': zipBuffer.length
    });

    return res.end(zipBuffer);

  } catch (error) {
    next(error);
  }
};

// ── PUT /api/solicitudes/:id/resolver ────────────────────────────────────────
const resolverSolicitud = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    await pool.query('UPDATE Solicitud SET resuelto = TRUE WHERE IdSolicitud = ?', [idSolicitud]);

    return res.status(200).json({ ok: true, mensaje: 'Solicitud resuelta correctamente.' });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/solicitudes/:id/oficio ──────────────────────────────────────────
const obtenerOficioAsignado = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.id);
    const idUsuario = req.usuario?.IdUsuario;

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Id de solicitud inválido.' });
    }

    const [rows] = await pool.query(
      `SELECT a.nombreArchivo, a.contenido 
       FROM TurnadoSolicitud ts
       INNER JOIN Archivo a ON ts.IdArchivoOficio = a.IdArchivo
       WHERE ts.IdSolicitud = ? AND ts.IdUsuarioResponsable = ?`,
      [idSolicitud, idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No se encontró el oficio para esta solicitud.' });
    }

    const archivo = rows[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(archivo.nombreArchivo)}"`);
    return res.status(200).send(archivo.contenido);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
