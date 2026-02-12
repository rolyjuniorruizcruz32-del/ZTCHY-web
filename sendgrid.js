async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        codigo: codigo,
        nombre: nombre,
        tipo: 'registro'
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('Correo enviado con éxito');
      return true;
    } else {
      console.error('Error al enviar:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return false;
  }
}
