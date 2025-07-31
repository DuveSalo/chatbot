import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

// 1. Create the transporter outside the function to reuse the connection.
const transporter = nodemailer.createTransport({
  // It's good practice to also move these to your config file.
  host: config.smtp_host || 'smtp.gmail.com',
  port: config.smtp_port || 587,
  secure: config.smtp_secure || false, // true for 465, false for other ports
  auth: {
    user: config.mail, // Your email user from config
    pass: config.pass  // Your email password or app password from config
  }
});

/**
 * Sends an email.
 * @param {object} mailOptions - The mail options.
 * @param {string} mailOptions.to - Recipient's email address.
 * @param {string} mailOptions.subject - Email subject.
 * @param {string} mailOptions.text - Plain text body of the email.
 * @param {string} [mailOptions.html] - HTML body of the email (optional).
 */
export async function sendMail({ to, subject, text, html }) {
  // 2. Add robust error handling.
  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${config.mail}>`, // Good practice to set a sender name
      to,
      subject,
      text,
      html // 3. Add support for HTML content.
    });

    console.log("Correo enviado: %s", info.messageId);
    return info; // Return the info object on success
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    // Re-throw the error to allow the caller to handle it.
    throw new Error('Failed to send email.');
  }
}
