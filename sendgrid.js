// === sendgrid.js (CONTENIDO COMPLETO) ===

/**
 * 1. Genera un código aleatorio de 6 dígitos
 */
function generarCodigoVerificacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 2. Envía el código usando nuestro nuevo backend seguro en Vercel
 */
async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
    console.log("Iniciando envío de email a través de la API segura...");
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                codigo, 
                nombre, 
                tipo: 'registro' 
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error en el servidor de correos');
        }

        console.log("Email enviado con éxito:", result);
        return { success: true };
    } catch (error) {
        console.error('Error detallado al enviar email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 3. Función para recuperación (opcional, pero útil tenerla)
 */
async function enviarCodigoRecuperacion(email, codigo, nombre = 'Usuario') {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo, nombre, tipo: 'recuperacion' })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Nota: La función guardarCodigoVerificacion normalmente usa tu cliente de Supabase. 
// Asegúrate de que esa función siga en tu registro.html o agrégala aquí si la necesitas.
