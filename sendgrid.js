async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo, nombre, tipo: 'registro' })
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}
