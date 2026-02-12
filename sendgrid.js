// 1. INICIALIZACIÓN (Asegúrate de tener esto arriba del todo)
// Las variables 'SUPABASE_URL' y 'SUPABASE_ANON_KEY' deben venir de tu config.js o script anterior
const supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 2. FUNCIÓN PARA GUARDAR (Para registro.html)
async function guardarCodigoVerificacion(userId, email, codigo) {
    try {
        const { error } = await supabase
            .from('verificaciones')
            .insert([{ user_id: userId, email: email, codigo: codigo }]);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("Error guardando:", e.message);
        return { success: false };
    }
}

// 3. FUNCIÓN PARA VERIFICAR (¡LA QUE TE FALTA EN verificar-email.html!)
async function verificarCodigo(email, codigoIngresado) {
    console.log("Verificando código para:", email);
    try {
        // Buscamos en la tabla de verificaciones el último código para ese email
        const { data, error } = await supabase
            .from('verificaciones')
            .select('*')
            .eq('email', email)
            .order('creado_en', { ascending: false })
            .limit(1);

        if (error) throw error;
        
        if (data.length > 0 && data[0].codigo === codigoIngresado) {
            console.log("✅ Código correcto");
            return { success: true };
        } else {
            console.log("❌ Código incorrecto o no encontrado");
            return { success: false, message: "Código inválido" };
        }
    } catch (e) {
        console.error("Error validando:", e.message);
        return { success: false, message: e.message };
    }
}

// 4. FUNCIÓN PARA ENVIAR EMAIL
async function enviarCodigoVerificacion(email, codigo, nombre) {
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nombre, tipo: 'registro' })
    });
    return await response.json();
}
