/**
 * Formatea una fecha como "DD de [mes] de YYYY" (ej: 02 de marzo de 2026)
 * @param {Date} date 
 */
const formatFechaDocumento = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '—';

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} de ${year}`;
};

/**
 * Retorna la fecha máxima sumando los días a la fecha base
 */
const calcularFechaMaxima = (fechaBaseStr, dias) => {
  const d = new Date(fechaBaseStr);
  if (isNaN(d)) return null;
  d.setDate(d.getDate() + dias);
  return d;
};

/**
 * Formatea una fecha como "DD de [mes]" (ej: 02 de marzo)
 */
const formatFechaCorto = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const month = monthNames[date.getMonth()];
  return `${day} de ${month}`;
};

module.exports = {
  formatFechaDocumento,
  formatFechaCorto,
  calcularFechaMaxima
};
