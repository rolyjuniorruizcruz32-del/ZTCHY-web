const { createClient } = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const { email, password, nombre } = req.body;
  
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const emailNormalizado = email.toLowerCase().trim();

  try {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const usuarioExistente = users?.find(u => u.email === emailNormalizado);

    if (usuarioExistente && usuarioExistente.email_confirmed_at) {
      return res.status(409).json({ 
        error: 'Cuenta ya verificada',
        action: 'redirect_to_login',
        email: emailNormalizado
      });
    }

    if (usuarioExistente && !usuarioExistente.email_confirmed_at) {
      await supabase.auth.admin.deleteUser(usuarioExistente.id);
    }

    await supabase.from('codigos_verificacion').update({ usado: true }).eq('email', emailNormalizado).eq('usado', false);
    await supabase.from('registros_temporales').upsert([{
      email: emailNormalizado,
      password_hash: password,
      nombre: nombre,
      expira_en: new Date(Date.now() + 15 * 60000).toISOString()
    }], { onConflict: 'email' });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEn = new Date(Date.now() + 10 * 60000).toISOString();

    await supabase.from('codigos_verificacion').insert([{ 
      email: emailNormalizado, codigo: codigo, tipo: 'registro', usado: false, expira_en: expiraEn
    }]);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: emailNormalizado,
      from: { email: 'ztchyweb@gmail.com', name: 'ZTCHY Web' },
      subject: 'Codigo de Verificacion - ZTCHY',
      html: '<h1>' + codigo + '</h1><p>Expira en 10 minutos</p>'
    });

    return res.status(200).json({ success: true, email: emailNormalizado });
  } catch (error) {
    return res.status(500).json({ error: 'Error', details: error.message });
  }
};
