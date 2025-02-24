import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

export async function sendMail({ to, subject, text }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Reemplaza por el host de tu servidor SMTP
    port: 587, // Usualmente 587 para conexiones TLS
    secure: false, // true para el puerto 465, false para otros
    auth: {
      user: config.mail, // Reemplaza por tu usuario de correo
      pass: config.pass
    }
  });

  // Envía el correo
  const info = await transporter.sendMail({
    from: config.mail, // Remitente
    to,       // Destinatario
    subject,  // Asunto
    text      // Cuerpo del mensaje
  });

  console.log("Correo enviado: %s", info.messageId);
}
