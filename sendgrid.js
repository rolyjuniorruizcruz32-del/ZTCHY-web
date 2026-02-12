// 1. INICIALIZACIÓN CORRECTA
// Asegúrate de tener este script en tu HTML antes que este archivo:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 2. GUARDAR CÓDIGO (Se usa en registro.html)
async function guardarCodigoVerificacion(userId, email, codigo) {
    console.log("Guardando código para:", email);
    try {
        const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Expira en 15 min
        const { error } = await supabaseClient
            .from('codigos_verificacion') // TU TABLA REAL
            .insert([{ 
                user_id: userId, 
                email: email, 
                codigo: codigo, 
                tipo: 'registro',
                expira_en: expiraEn,
                usado: false
            }]);

        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("❌ Error Supabase:", e.message);
        return { success: false, error: e.message };
    }
}

// 3. VERIFICAR CÓDIGO (¡ESTA ES LA QUE TE DABA ERROR!)
async function verificarCodigo(email, codigoIngresado) {
    console.log("Validando código:", codigoIngresado, "para", email);
    try {
        // Buscamos el código más reciente que no esté usado y no haya expirado
        const { data, error } = await supabaseClient
            .from('codigos_verificacion')
            .select('*')
            .eq('email', email)
            .eq('codigo', codigoIngresado)
            .eq('usado', false)
            .gt('expira_en', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            // 1. Marcamos el código como usado
            await supabaseClient
                .from('codigos_verificacion')
                .update({ usado: true, verificado_en: new Date().toISOString() })
                .eq('id', data[0].id);

            // 2. (Opcional) Marcamos el perfil como verificado
            await supabaseClient
                .from('perfiles')
                .update({ verificado: true })
                .eq('id', data[0].user_id);

            console.log("✅ Verificación exitosa");
            return { success: true };
        } else {
            console.log("❌ Código inválido o expirado");
            return { success: false, message: "Código incorrecto o expirado" };
        }
    } catch (e) {
        console.error("❌ Error en validación:", e.message);
        return { success: false, message: e.message };
    }
}

// 4. ENVIAR POR SENDGRID
async function enviarCodigoVerificacion(email, codigo, nombre) {
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nombre, tipo: 'registro' })
    });
    return await response.json();
}
