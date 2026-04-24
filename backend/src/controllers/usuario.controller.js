const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const ROLES_VALIDOS = ['Contralora', 'TI', 'Secretaria', 'Responsable', 'Supervisor'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Obtiene todos los usuarios con el rol 'Responsable'.
 * Se ordenan por IdUsuario para mantener la consistencia solicitada.
 */
const obtenerResponsables = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdUsuario, CONCAT_WS(" ", nombre, apellidoPaterno, apellidoMaterno, CASE WHEN puesto IS NOT NULL AND puesto != "" THEN CONCAT("- ", puesto) ELSE NULL END) AS nombre, correo FROM Usuario WHERE rol = "Responsable" ORDER BY IdUsuario ASC'
    );

    return res.status(200).json({
      ok: true,
      usuarios: rows,
    });
  } catch (error) {
    next(error);
  }
};

const obtenerTodosUsuarios = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdUsuario, nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, rol FROM Usuario ORDER BY IdUsuario ASC'
    );
    return res.status(200).json({ ok: true, usuarios: rows });
  } catch (error) {
    next(error);
  }
};

const crearUsuario = async (req, res, next) => {
  const { nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, rol, contrasena } = req.body;

  // Validaciones estrictas
  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ ok: false, mensaje: 'Nombre, correo, contraseña y rol son obligatorios.' });
  }
  if (!EMAIL_REGEX.test(correo)) {
    return res.status(400).json({ ok: false, mensaje: 'El formato del correo electrónico no es válido.' });
  }
  if (contrasena.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ ok: false, mensaje: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ ok: false, mensaje: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}` });
  }
  if (nombre.length > 30 || 
      (apellidoPaterno && apellidoPaterno.length > 30) || 
      (apellidoMaterno && apellidoMaterno.length > 30) ||
      (abreviacionOcupacion && abreviacionOcupacion.length > 10) ||
      (ocupacion && ocupacion.length > 30) ||
      (puesto && puesto.length > 50) ||
      (correo && correo.length > 100) || 
      (contrasena && contrasena.length > 50)) {
    return res.status(400).json({ 
      ok: false, 
      mensaje: 'Uno o más campos exceden la longitud máxima permitida (Nombres/Apellidos/Ocupación: 30, Abrev: 10, Puesto: 50, Correo: 100, Contraseña: 50).' 
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    const [result] = await pool.query(
      'INSERT INTO Usuario (nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, rol, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidoPaterno || '', apellidoMaterno || '', abreviacionOcupacion || '', puesto || '', ocupacion || '', correo, rol, hash]
    );

    const newId = result.insertId;

    if (rol === 'Responsable') {
      await pool.query('INSERT IGNORE INTO UsuarioResponsable (IdUsuario) VALUES (?)', [newId]);
    }

    return res.status(201).json({ ok: true, mensaje: 'Usuario creado exitosamente', id: newId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, mensaje: 'El correo ya está registrado.' });
    }
    next(error);
  }
};

const actualizarUsuario = async (req, res, next) => {
  const { id } = req.params;
  const { nombre, apellidoPaterno, apellidoMaterno, abreviacionOcupacion, puesto, ocupacion, correo, rol } = req.body;

  if (!nombre || !correo || !rol) {
    return res.status(400).json({ ok: false, mensaje: 'Nombre, correo y rol son obligatorios.' });
  }
  if (!EMAIL_REGEX.test(correo)) {
    return res.status(400).json({ ok: false, mensaje: 'El formato del correo electrónico no es válido.' });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ ok: false, mensaje: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}` });
  }
  if (nombre.length > 30 || 
      (apellidoPaterno && apellidoPaterno.length > 30) || 
      (apellidoMaterno && apellidoMaterno.length > 30) ||
      (abreviacionOcupacion && abreviacionOcupacion.length > 10) ||
      (ocupacion && ocupacion.length > 30) ||
      (puesto && puesto.length > 50) ||
      (correo && correo.length > 100)) {
    return res.status(400).json({ 
      ok: false, 
      mensaje: 'Uno o más campos exceden la longitud máxima permitida (Nombres/Apellidos/Ocupación: 30, Abrev: 10, Puesto: 50, Correo: 100).' 
    });
  }

  try {
    const [result] = await pool.query(
      'UPDATE Usuario SET nombre = ?, apellidoPaterno = ?, apellidoMaterno = ?, abreviacionOcupacion = ?, puesto = ?, ocupacion = ?, correo = ?, rol = ? WHERE IdUsuario = ?',
      [nombre, apellidoPaterno || '', apellidoMaterno || '', abreviacionOcupacion || '', puesto || '', ocupacion || '', correo, rol, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    // Actualizar tabla UsuarioResponsable si el rol cambió a Responsable
    if (rol === 'Responsable') {
      await pool.query('INSERT IGNORE INTO UsuarioResponsable (IdUsuario) VALUES (?)', [id]);
    } else {
      await pool.query('DELETE FROM UsuarioResponsable WHERE IdUsuario = ?', [id]);
    }

    return res.status(200).json({ ok: true, mensaje: 'Usuario actualizado correctamente.' });
  } catch (error) {
    next(error);
  }
};

const eliminarUsuario = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Intentar eliminar al usuario
    const [result] = await pool.query('DELETE FROM Usuario WHERE IdUsuario = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    return res.status(200).json({ ok: true, mensaje: 'Usuario eliminado permanentemente.' });
  } catch (error) {
    // Si hay error de restricción de Foreign Key
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'No se puede eliminar el usuario porque tiene procesos o dependencias activas (ej. Solicitudes, Respuestas, etc.).' 
      });
    }
    next(error);
  }
};

const obtenerMiPerfil = async (req, res, next) => {
  try {
    const id = req.usuario.IdUsuario;
    const [rows] = await pool.query('SELECT correo FROM Usuario WHERE IdUsuario = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }
    return res.status(200).json({ ok: true, perfil: rows[0] });
  } catch (error) {
    next(error);
  }
};

const actualizarMiPerfil = async (req, res, next) => {
  try {
    const id = req.usuario.IdUsuario;
    const { correo, contrasena } = req.body;

    if (!correo || correo.trim() === '') {
      return res.status(400).json({ ok: false, mensaje: 'El correo es obligatorio.' });
    }
    if (correo.length > 100) {
      return res.status(400).json({ ok: false, mensaje: 'El correo no puede exceder los 100 caracteres.' });
    }
    if (!EMAIL_REGEX.test(correo)) {
      return res.status(400).json({ ok: false, mensaje: 'El formato del correo electrónico no es válido.' });
    }
    if (contrasena && contrasena.trim() !== '') {
      if (contrasena.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ ok: false, mensaje: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
      }
      if (contrasena.length > 50) {
        return res.status(400).json({ ok: false, mensaje: 'La contraseña no puede exceder los 50 caracteres.' });
      }
    }

    let query = 'UPDATE Usuario SET correo = ? WHERE IdUsuario = ?';
    let params = [correo, id];

    if (contrasena && contrasena.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(contrasena, salt);
      query = 'UPDATE Usuario SET correo = ?, contrasena = ? WHERE IdUsuario = ?';
      params = [correo, hash, id];
    }

    await pool.query(query, params);
    return res.status(200).json({ ok: true, mensaje: 'Perfil actualizado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerResponsables,
  obtenerTodosUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerMiPerfil,
  actualizarMiPerfil,
};
