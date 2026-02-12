// sendgrid.js - VERSIÓN CORREGIDA

async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
    try {
        // IMPORTANTE: Ya no usamos SENDGRID_API_KEY aquí.
        // Ahora llamamos a nuestra propia API secreta en Vercel.
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                codigo, 
                nombre, 
                tipo: 'registro' 
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

// ... copia también generarCodigoVerificacion y guardarCodigoVerificacion
