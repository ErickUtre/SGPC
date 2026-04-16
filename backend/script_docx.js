const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
    sections: [{
        properties: {
            page: {
                margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
            }
        },
        children: [
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                    new TextRun({ text: 'Universidad Veracruzana', bold: true, size: 20 }),
                    new TextRun({ text: '\nJunta de Gobierno', size: 18, break: 1 }),
                    new TextRun({ text: '\nContraloría', size: 18, break: 1 }),
                    new TextRun({ text: '\n\nOf. Núm.: CG {folio}', bold: true, size: 20, break: 1 }),
                    new TextRun({ text: '\nAsunto: Solicitud de acceso a la', size: 18, break: 1 }),
                    new TextRun({ text: '\ninformación con folio {folio}.', size: 18, break: 1 })
                ]
            }),
            new Paragraph({ text: '', spacing: { after: 400 } }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'ffffff' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'ffffff' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'ffffff' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'ffffff' },
                    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'ffffff' },
                    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'ffffff' }
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 35, type: WidthType.PERCENTAGE },
                                margins: { left: 0, right: 200, top: 0, bottom: 0 },
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [
                                            new TextRun({ text: 'Contraloría General\n', bold: true, size: 16 }),
                                            new TextRun({ text: '\nMurillo Vidal Núm. 250\nCol. Cuauhtémoc\nC.P. 91069\nXalapa, Ver.\nMéxico\n\n', size: 14 }),
                                            new TextRun({ text: 'Teléfonos\n', bold: true, size: 14 }),
                                            new TextRun({ text: '01 228 814 28 91\n01 228 842 17 00\nExt. 11716\n\n', size: 14 }),
                                            new TextRun({ text: 'Correo electrónico\n', bold: true, size: 14 }),
                                            new TextRun({ text: 'contraloriagral@uv.mx\n\nwww.uv.mx/contraloria/', size: 14 })
                                        ]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 65, type: WidthType.PERCENTAGE },
                                margins: { left: 200, right: 0, top: 0, bottom: 0 },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: '{abreviacion} {nombre} {apellidoPaterno} {apellidoMaterno}', bold: true, size: 22 }),
                                            new TextRun({ text: '\n{puesto}', size: 20, break: 1 }),
                                            new TextRun({ text: '\nContraloría General de la Universidad Veracruzana', size: 20, break: 1 }),
                                            new TextRun({ text: '\nP r e s e n t e.', size: 20, break: 1 })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: 'Apreciable {ocupacion} {apellidoPaterno} {apellidoMaterno},', italics: true, size: 20 })
                                        ],
                                        spacing: { before: 200, after: 200 }
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.JUSTIFIED,
                                        children: [
                                            new TextRun({ text: 'Con fundamento en lo dispuesto por los artículos 34-B, y 34-C, fracción XI, de la Ley Orgánica de la Universidad Veracruzana; 4, fracción X, 14, 15, y 17, fracciones IV y XIV, 336, fracción XXIII, del Estatuto General de la Universidad Veracruzana; y en atención al “Acuerdo mediante el cual se instruye a las áreas de la Contraloría General para atender las solicitudes de acceso a la información, dentro del ámbito de su competencia”, de fecha {fechaReferencia}, me permito remitir a usted la solicitud de información recibida el {fechaHoyLong}, a través de la Plataforma Nacional de Transparencia, registrada con el número de folio {folio}, que se adjunta, la cual tiene como fecha de vencimiento para su atención el día {fechaMaxima}.', size: 20 })
                                        ],
                                        spacing: { after: 200 }
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.JUSTIFIED,
                                        children: [
                                            new TextRun({ text: 'Lo anterior, con la finalidad de que, en el ámbito de su competencia, se lleve a cabo el análisis respectivo y se otorgue la respuesta que corresponda, conforme a los plazos establecidos en el artículo 116 de la Ley Número 250 de Transparencia y Acceso a la Información Pública del Estado de Veracruz de Ignacio de la Llave, a través de los medios establecidos por la Coordinación Universitaria de Transparencia, Acceso a la Información y Protección de Datos Personales (CUTAI).', size: 20 })
                                        ],
                                        spacing: { after: 200 }
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.JUSTIFIED,
                                        children: [
                                            new TextRun({ text: 'Sin otro particular, hago propicia la ocasión para enviarle un cordial saludo.', size: 20 })
                                        ],
                                        spacing: { after: 400 }
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({ text: 'A T E N T A M E N T E.', bold: true, size: 20 }),
                                            new TextRun({ text: '\n“Lis de Veracruz: Arte, Ciencia, Luz”', size: 20, break: 1 }),
                                            new TextRun({ text: '\nXalapa, Ver., a {fechaHoyLong}', size: 20, break: 1 })
                                        ]
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({ text: 'M.A.P. Norma Hilda Jiménez Martínez', bold: true, size: 20 }),
                                            new TextRun({ text: '\nContralora General', size: 20, break: 1 })
                                        ],
                                        spacing: { before: 800 }
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: 'C.c.p. Archivo.\nElaboró: RLDG', size: 14 })
                                        ],
                                        spacing: { before: 400 }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(__dirname, 'templates/Plantilla Oficio Solicitud Transparencia.docx'), buffer);
    console.log('Plantilla generada exitosamente.');
});
