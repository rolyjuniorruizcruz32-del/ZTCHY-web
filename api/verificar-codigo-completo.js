// API Route: /api/verificar-codigo-completo.js
// Esta API verifica el código Y CREA el usuario en auth

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: 'Email y código requeridos' });
  }

  const emailNormalizado = email.toLowerCase().trim();
  const codigoLimpio = codigo.toString().trim();

  try {
    console.log('🔍 Verificando código para:', emailNormalizado);

    // 1. Buscar el código en la base de datos
    const { data: codigoData, error: queryError } = await supabase
      .from('codigos_verificacion')
      .select('*')
      .eq('email', emailNormalizado)
      .eq('codigo', codigoLimpio)
      .eq('tipo', 'registro')
      .eq('usado', false)
      .order('expira_en', { ascending: false })
      .limit(1)
      .single();

    if (queryError || !codigoData) {
      console.log('❌ Código no encontrado o ya usado');
      return res.status(400).json({ 
        error: 'Código incorrecto o ya utilizado'
      });
    }

    // 2. Verificar expiración
    const ahora = new Date();
    const expiracion = new Date(codigoData.expira_en);
    
    if (ahora > expiracion) {
      console.log('⏰ Código expirado');
      
      await supabase
        .from('codigos_verificacion')
        .update({ usado: true })
        .eq('id', codigoData.id);
      
      return res.status(400).json({ 
        error: 'El código ha expirado. Solicita uno nuevo.',
        expired: true
      });
    }

    // 3. Obtener datos del registro temporal
    const { data: registroTemp, error: tempError } = await supabase
      .from('registros_temporales')
      .select('*')
      .eq('email', emailNormalizado)
      .single();

    if (tempError || !registroTemp) {
      console.error('❌ No se encontraron datos del registro temporal');
      return res.status(400).json({ 
        error: 'Datos de registro no encontrados. Por favor regístrate nuevamente.'
      });
    }

    console.log('✅ Datos de registro encontrados');

    // 4. AHORA SÍ crear el usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emailNormalizado,
      password: registroTemp.password_hash,
      email_confirm: true, // ✅ Marcar como verificado inmediatamente
      user_metadata: { 
        full_name: registroTemp.nombre 
      }
    });

    if (authError) {
      console.error('❌ Error al crear usuario en auth:', authError);
      
      // Si el usuario ya existe, intentar actualizarlo
      if (authError.message.includes('already registered')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const usuarioExistente = users?.find(u => u.email === emailNormalizado);
        
        if (usuarioExistente) {
          // Actualizar el usuario existente para marcarlo como verificado
          await supabase.auth.admin.updateUserById(usuarioExistente.id, {
            email_confirm: true,
            user_metadata: { full_name: registroTemp.nombre }
          });
          
          console.log('✅ Usuario existente actualizado y verificado');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuario creado en auth:', authData);
    }

    // 5. Marcar código como usado
    await supabase
      .from('codigos_verificacion')
      .update({ usado: true })
      .eq('id', codigoData.id);

    // 6. Eliminar registro temporal
    await supabase
      .from('registros_temporales')
      .delete()
      .eq('email', emailNormalizado);

    console.log('✅ Verificación completada exitosamente');

    return res.status(200).json({ 
      success: true,
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
      email: emailNormalizado
    });

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return res.status(500).json({ 
      error: 'Error al verificar el código',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
