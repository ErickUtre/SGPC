const fs = require('fs');
const path = require('path');
const AdmZip = require('../node_modules/adm-zip');

const templatePath = path.join(__dirname, '../templates/Plantilla Oficio Solicitud Transparencia.docx');

if (!fs.existsSync(templatePath)) {
  console.error('Template not found at:', templatePath);
  process.exit(1);
}

const zip = new AdmZip(templatePath);

const transformXmlSafe = (xml) => {
  let newXml = xml;

  // 1. REPAIR previous corruption (if any remains)
  newXml = newXml.split('{abreviacion}/w:t>').join('{abreviacion}</w:t>');

  // 2. NORMALIZATION: Merge fragmented tags like <w:t>{</w:t><w:t>nombre</w:t><w:t>}</w:t>
  // This is a common Word issue. We'll join consecutive text nodes if they are small.
  newXml = newXml.replace(/<\/w:t><w:r[^>]*><w:rPr>.*?<\/w:rPr><w:t>/g, '');
  newXml = newXml.replace(/<\/w:t><w:t>/g, '');

  // 3. LAYOUT: Increase left indentation to avoid sidebar overlap
  // Replacing w:left="142" with w:left="2500" (approx 4.4cm)
  newXml = newXml.split('w:left="142"').join('w:left="2800"');

  // 4. Literal replacements (Treat as strings, not regex)
  const replacements = [
    { search: '940564226000077', replace: '{folio}' },
    { search: 'C.P.', replace: '{abreviacion}' },
    { search: 'María del Carmen', replace: '{nombre}' },
    { search: 'Peña', replace: '{apellidoPaterno}' },
    { search: 'Cabrera', replace: '{apellidoMaterno}' },
    { search: 'Directora de Auditoría', replace: '{puesto}' },
    { search: 'Contadora', replace: '{ocupacion}' },
    { search: '17 de septiembre de 2025', replace: '{fechaReferencia}' }, // Dynamicize this too just in case
    { search: '02 de marzo de 2026', replace: '{fechaHoyLong}' },
    { search: '02 de marzo', replace: '{fechaHoyShort}' },
    { search: '08 de abril de 2026', replace: '{fechaMaxima}' }
  ];

  replacements.forEach(r => {
    newXml = newXml.split(r.search).join(r.replace);
  });

  return newXml;
};

// Transform document.xml
const docXml = zip.readAsText('word/document.xml');
let NewDocXml = transformXmlSafe(docXml);
zip.updateFile('word/document.xml', Buffer.from(NewDocXml));

// Transform header1.xml
let headerXml = zip.readAsText('word/header1.xml');
// Move the sidebar even further left or adjust positioning
headerXml = headerXml.split('margin-top:-38.05pt').join('margin-top:0pt');
// Sidebar horizontal offset: move it to the extreme left
headerXml = headerXml.split('<wp:posOffset>-1393825</wp:posOffset>').join('<wp:posOffset>-1800000</wp:posOffset>');
zip.updateFile('word/header1.xml', Buffer.from(transformXmlSafe(headerXml)));

// Save the transformed template
zip.writeZip(templatePath);
console.log('Template layout and tags optimized!');
