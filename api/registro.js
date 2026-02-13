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
    console.log('Iniciando registro para:', emailNormalizado);

    // 1. Verificar si usuario existe y está verificado
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const usuarioExistente = users?.find(u => u.email === emailNormalizado);

    if (usuarioExistente && usuarioExistente.email_confirmed_at) {
      return res.status(409).json({ 
        error: 'Cuenta ya verificada',
        action: 'redirect_to_login',
        email: emailNormalizado
      });
    }

    // 2. Si existe pero no está verificado, eliminarlo
    if (usuarioExistente && !usuarioExistente.email_confirmed_at) {
      console.log('Eliminando usuario no verificado');
      await supabase.auth.admin.deleteUser(usuarioExistente.id);
    }

    // 3. Invalidar códigos anteriores
    await supabase
      .from('codigos_verificacion')
      .update({ usado: true })
      .eq('email', emailNormalizado)
      .eq('usado', false);

    // 4. Guardar datos temporales
    await supabase
      .from('registros_temporales')
      .upsert([{
        email: emailNormalizado,
        password_hash: password,
        nombre: nombre,
        expira_en: new Date(Date.now() + 15 * 60000).toISOString()
      }], { onConflict: 'email' });

    // 5. Generar código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEn = new Date(Date.now() + 10 * 60000).toISOString();

    // 6. Guardar código en DB
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
      console.error('Error al guardar codigo:', codigoError);
      throw new Error('Error al generar codigo');
    }

    console.log('Codigo guardado:', codigo);

    // 7. Enviar email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: emailNormalizado,
      from: {
        email: 'ztchyweb@gmail.com',
        name: 'ZTCHY Web'
      },
      subject: 'Codigo de Verificacion - ZTCHY',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hola ${nombre}!</h2>
          <p>Tu codigo de verificacion es:</p>
          <div style="background: #f0f0f0; padding: 30px; text-align: center; border-radius: 8px;">
            <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 8px;">${codigo}</h1>
          </div>
          <p>Este codigo expira en 10 minutos.</p>
          <p style="color: #999; font-size: 12px;">Si este email esta en SPAM, marcalo como "No es spam"</p>
        </div>
      `,
      text: `Tu codigo de verificacion de ZTCHY es: ${codigo}. Expira en 10 minutos.`
    });

    console.log('Email enviado correctamente');

    return res.status(200).json({ 
      success: true,
      email: emailNormalizado,
      message: 'Codigo enviado'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ 
      error: 'Error al procesar registro',
      details: error.message 
    });
  }
};
