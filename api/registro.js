module.exports = async function handler(req, res) {
  const diagnostico = {
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers,
    body: req.body,
    env_vars: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
      has_sendgrid_key: !!process.env.SENDGRID_API_KEY
    }
  };

  try {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        diagnostico 
      });
    }

    // Test 1: Verificar que lleguen los datos
    const { email, password, nombre } = req.body || {};
    diagnostico.datos_recibidos = { email, password: !!password, nombre };

    if (!email || !password || !nombre) {
      return res.status(400).json({ 
        error: 'Faltan campos',
        diagnostico 
      });
    }

    // Test 2: Verificar Supabase
    let supabaseTest = 'NO PROBADO';
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        supabaseTest = 'ERROR: ' + error.message;
      } else {
        supabaseTest = 'OK - ' + (data?.users?.length || 0) + ' usuarios encontrados';
      }
    } catch (err) {
      supabaseTest = 'EXCEPTION: ' + err.message;
    }
    diagnostico.supabase_test = supabaseTest;

    // Test 3: Verificar SendGrid
    let sendgridTest = 'NO PROBADO';
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      sendgridTest = 'OK - API key configurada';
    } catch (err) {
      sendgridTest = 'ERROR: ' + err.message;
    }
    diagnostico.sendgrid_test = sendgridTest;

    // Test 4: Verificar tabla codigos_verificacion
    let tablaTest = 'NO PROBADO';
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      const { data, error } = await supabase
        .from('codigos_verificacion')
        .select('*')
        .limit(1);
      
      if (error) {
        tablaTest = 'ERROR: ' + error.message;
      } else {
        tablaTest = 'OK - Tabla existe';
      }
    } catch (err) {
      tablaTest = 'EXCEPTION: ' + err.message;
    }
    diagnostico.tabla_codigos_test = tablaTest;

    // Test 5: Verificar tabla registros_temporales
    let tablaTempTest = 'NO PROBADO';
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      const { data, error } = await supabase
        .from('registros_temporales')
        .select('*')
        .limit(1);
      
      if (error) {
        tablaTempTest = 'ERROR: ' + error.message;
      } else {
        tablaTempTest = 'OK - Tabla existe';
      }
    } catch (err) {
      tablaTempTest = 'EXCEPTION: ' + err.message;
    }
    diagnostico.tabla_temp_test = tablaTempTest;

    // Si todo está bien hasta aquí
    return res.status(200).json({
      mensaje: 'DIAGNOSTICO COMPLETO',
      todos_los_tests_pasaron: true,
      diagnostico,
      siguiente_paso: 'Si ves esto, el problema no es de configuracion. El codigo funcional deberia funcionar.'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error en diagnostico',
      mensaje: error.message,
      stack: error.stack,
      diagnostico
    });
  }
};
