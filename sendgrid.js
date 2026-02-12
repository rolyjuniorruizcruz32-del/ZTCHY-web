// === sendgrid.js (VERSION FINAL COMPLETA) ===

// 1. Generar el número
function generarCodigoVerificacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 2. GUARDAR en Supabase (La que te falta ahora)
async function guardarCodigoVerificacion(userId, email, codigo) {
    console.log("Guardando código en Supabase para:", email);
    try {
        // 'verificaciones' es el nombre de tu tabla en Supabase
        const { data, error } = await supabase
            .from('verificaciones')
            .insert([
                { 
                    user_id: userId, 
                    email: email, 
                    codigo: codigo,
                    creado_en: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error en DB:", error);
        return { success: false, error: error.message };
    }
}

// 3. ENVIAR por Email (Vercel API)
async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo, nombre, tipo: 'registro' })
        });
        return await response.json();
    } catch (error) {
        console.error('Error Email:', error);
        return { success: false, error: error.message };
    }
}
