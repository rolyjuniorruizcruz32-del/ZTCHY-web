const sgMail = require('@sendgrid/mail');
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  const { email, codigo, nombre, tipo } = req.body;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    await sgMail.send({
      to: email,
      from: 'ztchyweb@gmail.com',
      subject: tipo === 'registro' ? '🔐 Código de Verificación' : '🔑 Recuperación',
      html: `<h1>${codigo}</h1>`
    });
    res.status(200).json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
