// backend/utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarCorreo = async (para, asunto, mensaje) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: para,
    subject: asunto,
    text: mensaje,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado:', info.response);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
};
