const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Configuración del transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Crea una notificación en la base de datos y envía un correo electrónico.
 * @param {number} idDestinatario - ID del usuario que recibe la notificación.
 * @param {string} titulo - Título corto de la notificación.
 * @param {string} descripcion - Cuerpo o detalle de la notificación.
 * @param {number|null} idRemitente - ID del remitente (null si es el Sistema).
 */
const enviarNotificacion = async (idDestinatario, titulo, descripcion, idRemitente = null) => {
  try {
    // 1. Insertar en la base de datos
    await pool.query(
      'INSERT INTO Notificacion (nombreNotificacion, descripcion, IdRemitente, IdDestinatario, leida) VALUES (?, ?, ?, ?, FALSE)',
      [titulo, descripcion, idRemitente, idDestinatario]
    );

    // 2. Obtener el correo del destinatario
    const [rows] = await pool.query('SELECT correo, nombre FROM Usuario WHERE IdUsuario = ?', [idDestinatario]);
    
    if (rows.length === 0) {
      console.error(`No se encontró el usuario destinatario con ID: ${idDestinatario}`);
      return;
    }

    const { correo, nombre } = rows[0];

    // 3. Enviar correo electrónico
    // Si no hay credenciales SMTP configuradas, mostramos un warning pero no rompemos el flujo.
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'tu_correo@ejemplo.com') {
      console.warn('⚠️ Credenciales SMTP no configuradas. El correo no será enviado a:', correo);
      return;
    }

    const mailOptions = {
      from: `"Sistema de Gestión de Procesos de la Contraloría" <${process.env.SMTP_USER}>`,
      to: correo,
      subject: titulo,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1e4b8f;">Hola, ${nombre}</h2>
          <p style="font-size: 16px; color: #333;">Tienes una nueva notificación en el <strong>Sistema de Gestión de Procesos de la Contraloría</strong>:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1e4b8f; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e4b8f;">${titulo}</h3>
            <p style="margin-bottom: 0; color: #555; white-space: pre-wrap;">${descripcion}</p>
          </div>
          
          <p style="font-size: 14px; color: #777;">
            Por favor, ingresa al sistema para más detalles.<br/>
            Este es un correo automático, por favor no respondas a este mensaje.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Notificación enviada a ${correo}: ${titulo}`);

  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
    // No lanzamos el error para no bloquear el flujo principal de la aplicación
    // si el servidor de correo falla.
  }
};

module.exports = {
  enviarNotificacion
};
