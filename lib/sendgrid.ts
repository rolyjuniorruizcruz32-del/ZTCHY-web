import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verifica tu correo electrónico</h2>
          <p>Gracias por registrarte. Por favor, haz clic en el botón de abajo para verificar tu correo electrónico:</p>
          <a href="${verificationUrl}" class="button">Verificar correo electrónico</a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <div class="footer">
            <p>Si no solicitaste esta verificación, por favor ignora este correo.</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  return sendEmail(email, 'Verifica tu correo electrónico', html)
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #DC2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Restablece tu contraseña</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
          <a href="${resetUrl}" class="button">Restablecer contraseña</a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <div class="footer">
            <p>Si no solicitaste restablecer tu contraseña, por favor ignora este correo y tu contraseña permanecerá sin cambios.</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  return sendEmail(email, 'Restablece tu contraseña', html)
}
