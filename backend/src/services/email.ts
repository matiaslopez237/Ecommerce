import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Centro Médico Santo Domingo" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Confirmá tu cuenta — Centro Médico Santo Domingo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 32px; background: #f9f5f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 36px; color: #8B7355;">✚</span>
          <h2 style="color: #5E4A35; margin: 8px 0 0; font-size: 20px;">Centro Médico Santo Domingo</h2>
        </div>

        <h3 style="color: #5E4A35; font-size: 18px; margin-bottom: 12px;">Confirmá tu cuenta</h3>
        <p style="color: #666; line-height: 1.7; margin-bottom: 28px;">
          Gracias por registrarte. Para activar tu cuenta y empezar a usarla, hacé click en el botón de abajo.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${verifyUrl}"
            style="background: #8B7355; color: white; padding: 14px 36px; border-radius: 25px;
                   text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Confirmar mi cuenta
          </a>
        </div>

        <p style="color: #aaa; font-size: 12px; text-align: center; line-height: 1.6;">
          Si no te registraste en nuestro sitio, ignorá este email.<br/>
          El link es válido por 24 horas.
        </p>
      </div>
    `,
  });
}
