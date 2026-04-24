const fs = require('fs');
const path = require('path');
const { createReport } = require('docx-templates');
const libre = require('libreoffice-convert');
const { promisify } = require('util');
const { formatFechaDocumento, formatFechaCorto, calcularFechaMaxima } = require('./dateUtils');

const convertAsync = promisify(libre.convert);

/**
 * Genera un Oficio PDF basado en la plantilla Word
 * @param {Object} data Datos para los placeholders
 * @returns {Promise<Buffer>} El buffer del PDF generado
 */
const generarOficioPDF = async (data) => {
  try {
    const templatePath = path.join(__dirname, '../../templates/Plantilla Oficio Solicitud Transparencia.docx');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`No se encontró la plantilla en: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath);

    // 1. Preparar datos para la plantilla
    // Se fuerza la fecha a la zona horaria de México (CST/CDT -06:00)
    const formatter = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const parts = formatter.formatToParts(new Date());
    const d = parts.find(p => p.type === 'day').value;
    const m = parts.find(p => p.type === 'month').value;
    const y = parts.find(p => p.type === 'year').value;
    
    // Convertimos a objeto Date de JS (mes es 0-indexed)
    const hoy = new Date(y, parseInt(m) - 1, d);
    
    const fechaActualStrLong = formatFechaDocumento(hoy);
    const fechaActualStrShort = formatFechaCorto(hoy);
    
    // Calculamos fecha máxima de respuesta
    const fMax = calcularFechaMaxima(data.solicitudFechaRegistro, data.solicitudDiasMaximos);
    const fechaMaximaStr = fMax ? formatFechaDocumento(fMax) : '—';

    const reportData = {
      folioOficio: data.folioOficio,
      folio: data.solicitudFolio, // El folio de la solicitud (UV-TR-...)
      abreviacionOcupacion: (data.responsableAbreviacion || '').replace(/\.+$/, ''), // Nueva etiqueta solicitada
      abreviacion: (data.responsableAbreviacion || '').replace(/\.+$/, ''),
      nombre: data.responsableNombre || '',
      apellidoPaterno: data.responsableApellidoPaterno || '',
      apellidoMaterno: data.responsableApellidoMaterno || '',
      puesto: data.responsablePuesto || '',
      ocupacion: data.responsableOcupacion || '',
      fechaHoyLong: fechaActualStrLong,
      fechaHoyShort: fechaActualStrShort,
      fechaMaxima: fechaMaximaStr,
      fechaReferencia: '17 de septiembre de 2025' // Fecha del acuerdo citada en el oficio
    };

    // 2. Generar el documento Word (en memoria)
    const docxBuffer = await createReport({
      template: templateContent,
      data: reportData,
      cmdDelimiter: ['{', '}'], // Usar formato estándar de llaves
    });

    // 3. Convertir Word a PDF usando LibreOffice
    const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);

    return pdfBuffer;
  } catch (error) {
    console.error('Error en generarOficioPDF:', error);
    throw error;
  }
};

module.exports = {
  generarOficioPDF
};
