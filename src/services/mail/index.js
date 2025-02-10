import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, text }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.tuservidor.com', // Reemplaza por el host de tu servidor SMTP
    port: 587, // Usualmente 587 para conexiones TLS
    secure: false, // true para el puerto 465, false para otros
    auth: {
      user: '', // Reemplaza por tu usuario de correo
      pass: 'tucontraseña'            // Reemplaza por tu contraseña
    }
  });

  // Envía el correo
  const info = await transporter.sendMail({
    from: '', // Remitente
    to,       // Destinatario
    subject,  // Asunto
    text      // Cuerpo del mensaje
  });

  console.log("Correo enviado: %s", info.messageId);
}
