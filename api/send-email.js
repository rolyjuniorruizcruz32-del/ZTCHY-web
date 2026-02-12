const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, codigo, nombre, tipo } = req.body;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL || 'ztchyweb@gmail.com',
    subject: tipo === 'registro' ? 'Código de Verificación' : 'Recuperación de Contraseña',
    text: `Hola ${nombre}, tu código es: ${codigo}`,
    html: `<strong>Hola ${nombre}</strong><p>Usa el siguiente código para completar tu proceso: <b>${codigo}</b></p>`
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
