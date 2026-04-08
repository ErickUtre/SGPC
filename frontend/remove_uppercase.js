import fs from 'fs';
const files = [
  'src/pages/SolicitudesTransparenciaResponsable.jsx',
  'src/pages/SolicitudesTransparenciaTI.jsx',
  'src/pages/SolicitudesTransparenciaContralora.jsx',
  'src/pages/SolicitudesTransparenciaSecretaria.jsx'
];

files.forEach(f => {
  const filepath = `d:/Usuarios/sscontraloria/Desktop/Sistema de procesos contraloria/SGPC/frontend/${f}`;
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Replace uppercase
    content = content.replace(/(class|className)=(["'][^"']*)uppercase([^"']*["'])/g, (match, p1, p2, p3) => {
        return `${p1}=${p2}${p3}`;
    });
    
    // Clean extra spaces
    content = content.replace(/className=(["']) *(.*?) *(["'])/g, (match, p1, p2, p3) => {
       const cleaned = p2.replace(/\s+/g, ' ').trim();
       return `className=${p1}${cleaned}${p3}`;
    });

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Replaced in ${f}`);
  } else {
    console.log(`File not found: ${filepath}`);
  }
});
