const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

try {
  const docPath = 'Documentación de SGPC.docx';
  if (!fs.existsSync(docPath)) {
    console.log('El archivo no existe.');
    process.exit(1);
  }

  const zip = new AdmZip(docPath);
  const content = zip.readAsText('word/document.xml');
  
  // Limpieza básica de etiquetas XML para leer el texto plano
  const text = content.replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
  
  console.log('--- CONTENIDO DEL DOCUMENTO ---\n');
  console.log(text.substring(0, 2000)); // Mostrar los primeros 2000 caracteres
  console.log('\n--- FIN ---');
} catch (err) {
  console.error('Error al leer el Word:', err);
}
