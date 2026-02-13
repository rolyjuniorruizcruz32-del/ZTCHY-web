// API Route: /api/registro.js
// NUEVA ESTRATEGIA: Solo guardamos el código, NO creamos usuario hasta verificar

import { createClient } from '@supabase/supabase-js';
const sgMail = require('@sendgrid/mail');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
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

    // 1. Verificar si el usuario YA ESTÁ VERIFICADO en auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const usuarioExistente = users?.find(u => u.email === emailNormalizado);

    if (usuarioExistente && usuarioExistente.email_confirmed_at) {
      // Usuario ya existe y está verificado
      console.log('✅ Usuario ya verificado:', emailNormalizado);
      return res.status(409).json({ 
        error: 'Esta cuenta ya está registrada y verificada',
        action: 'redirect_to_login',
        email: emailNormalizado
      });
    }

    // 2. Si el usuario existe pero NO está verificado, eliminarlo
    if (usuarioExistente && !usuarioExistente.email_confirmed_at) {
      console.log('🗑️ Eliminando usuario no verificado:', emailNormalizado);
      await supabase.auth.admin.deleteUser(usuarioExistente.id);
    }

    // 3. Invalidar códigos anteriores
    await supabase
      .from('codigos_verificacion')
      .update({ usado: true })
      .eq('email', emailNormalizado)
      .eq('usado', false);

    // 4. Guardar datos temporales del registro (nueva tabla)
    const { error: tempError } = await supabase
      .from('registros_temporales')
      .upsert([{
        email: emailNormalizado,
        password_hash: password, // En producción, hashear esto
        nombre: nombre,
        expira_en: new Date(Date.now() + 15 * 60000).toISOString() // 15 minutos
      }], { onConflict: 'email' });

    if (tempError && tempError.code !== '23505') { // Ignorar duplicate key
      console.error('⚠️ Error al guardar registro temporal:', tempError);
    }

    // 5. Generar código de verificación
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

    // 6. Enviar email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: emailNormalizado,
      from: {
        email: 'ztchyweb@gmail.com',
        name: 'ZTCHY Web'
      },
      subject: '🎉 Verifica tu cuenta en ZTCHY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f7f7f7;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ZTCHY</h1>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">¡Hola ${nombre}! 👋</h2>
            <p style="color: #666; font-size: 16px;">Estás a un paso de unirte a ZTCHY. Tu código de verificación es:</p>
            
            <div style="background: #f0f0f0; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #667eea;">
              <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold;">${codigo}</h1>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">⏰ Este código expirará en <strong>10 minutos</strong></p>
            
            <div style="background: #fff3cd; padding: 15px; margin-top: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="color: #856404; font-size: 13px; margin: 0;">
                ⚠️ <strong>Importante:</strong> Este email puede llegar a SPAM. Si no lo ves, revisa tu carpeta de correo no deseado.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              Si no solicitaste este código, ignora este mensaje.
            </p>
          </div>
        </div>
      `,
      text: `Hola ${nombre}! Tu código de verificación de ZTCHY es: ${codigo}. Expira en 10 minutos.`
    });

    console.log('✅ Email enviado correctamente');

    return res.status(200).json({ 
      success: true,
      message: 'Código enviado. Verifica tu email.',
      email: emailNormalizado
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return res.status(500).json({ 
      error: 'Error al procesar registro',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
