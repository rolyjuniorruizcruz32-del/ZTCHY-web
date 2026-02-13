const { createClient } = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password, nombre } = req.body;

  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const emailNormalizado = email.toLowerCase().trim();

  try {
    console.log('📝 Procesando registro para:', emailNormalizado);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const usuarioExistente = users?.find(u => u.email === emailNormalizado);

    if (usuarioExistente && usuarioExistente.email_confirmed_at) {
      console.log('✅ Usuario ya verificado:', emailNormalizado);
      return res.status(409).json({ 
        error: 'Esta cuenta ya está registrada y verificada',
        action: 'redirect_to_login',
        email: emailNormalizado
      });
    }

    if (usuarioExistente && !usuarioExistente.email_confirmed_at) {
      console.log('🗑️ Eliminando usuario no verificado:', emailNormalizado);
      await supabase.auth.admin.deleteUser(usuarioExistente.id);
    }

    await supabase
      .from('codigos_verificacion')
      .update({ usado: true })
      .eq('email', emailNormalizado)
      .eq('usado', false);

    await supabase
      .from('registros_temporales')
      .upsert([{
        email: emailNormalizado,
        password_hash: password,
        nombre: nombre,
        expira_en: new Date(Date.now() + 15 * 60000).toISOString()
      }], { onConflict: 'email' });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEn = new Date(Date.now() + 10 * 60000).toISOString();

    const { error: codigoError } = await supabase
      .from('codigos_verificacion')
      .insert([{ 
        email: emailNormalizado,
        codigo: codigo,
        tipo: 'registro',
        usado: false,
        expira_en: expiraEn
      }]);

    if (codigoError) {
      console.error('❌ Error al guardar código:', codigoError);
      throw new Error('Error al generar código');
    }

    console.log('✅ Código generado:', codigo);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: emailNormalizado,
      from: {
        email: 'ztchyweb@gmail.com',
        name: 'ZTCHY Web'
      },
      subject: '🎉 Verifica tu cuenta en ZTCHY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>¡Hola ${nombre}! 👋</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f0f0f0; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 8px;">${codigo}</h1>
          </div>
          <p>Este código expirará en 10 minutos.</p>
        </div>
      `
    });

    console.log('✅ Email enviado correctamente');

    return res.status(200).json({ 
      success: true,
      message: 'Código enviado',
      email: emailNormalizado
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return res.status(500).json({ 
      error: 'Error al procesar registro',
      details: error.message
    });
  }
};
