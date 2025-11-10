import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Crear el transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Restablecer Contraseña - Deyfus',
    html: `
      <h1>Restablecer tu contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Si no solicitaste esto, ignora este correo.</p>
      <p>El enlace expirará en 1 hora.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de recuperación enviado a:', email);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar el email de recuperación');
  }
};