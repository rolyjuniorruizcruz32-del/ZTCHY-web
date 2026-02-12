const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, codigo, nombre } = req.body;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: 'ztchyweb@gmail.com', // Debe estar verificado en SendGrid
    subject: 'Tu código de verificación ZTCHY',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2>Hola ${nombre},</h2>
        <p>Tu código de seguridad es:</p>
        <h1 style="color: #4f46e5; letter-spacing: 5px;">${codigo}</h1>
        <p>Expira en 15 minutos.</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
