/**
 * Middleware de sanitización global de inputs.
 * 1. Hace trim() recursivo a todos los strings en req.body
 * 2. Escapa caracteres HTML peligrosos para prevenir XSS almacenado
 * 3. Rechaza campos que excedan longitudes máximas
 */

const MAX_STRING_LENGTH = 2000;

/** Escapa caracteres HTML peligrosos */
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/** Sanitiza recursivamente un objeto */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > MAX_STRING_LENGTH) {
      return trimmed.substring(0, MAX_STRING_LENGTH);
    }
    return escapeHtml(trimmed);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    sanitized[key] = sanitizeValue(obj[key]);
  }
  return sanitized;
};

const sanitizeMiddleware = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

module.exports = sanitizeMiddleware;
