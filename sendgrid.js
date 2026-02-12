// sendgrid.js - Funciones para enviar emails con SendGrid

// Generar código de 6 dígitos aleatorio
function generarCodigoVerificacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar email de verificación con código de 6 dígitos
async function enviarCodigoVerificacion(email, codigo, nombre = 'Usuario') {
    try {
        const apiKey = SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
        
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: email, name: nombre }],
                        subject: 'Código de Verificación - ' + SENDER_NAME
                    }
                ],
                from: {
                    email: SENDER_EMAIL,
                    name: SENDER_NAME
                },
                content: [
                    {
                        type: 'text/html',
                        value: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .container {
                                        max-width: 600px;
                                        margin: 40px auto;
                                        background-color: white;
                                        border-radius: 10px;
                                        overflow: hidden;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    }
                                    .header {
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        padding: 30px;
                                        text-align: center;
                                    }
                                    .content {
                                        padding: 40px;
                                        text-align: center;
                                    }
                                    .code-box {
                                        background-color: #f8f9fa;
                                        border: 2px dashed #667eea;
                                        border-radius: 10px;
                                        padding: 20px;
                                        margin: 30px 0;
                                    }
                                    .code {
                                        font-size: 36px;
                                        font-weight: bold;
                                        color: #667eea;
                                        letter-spacing: 8px;
                                        font-family: 'Courier New', monospace;
                                    }
                                    .footer {
                                        background-color: #f8f9fa;
                                        padding: 20px;
                                        text-align: center;
                                        color: #666;
                                        font-size: 12px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>🔐 Verificación de Email</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hola <strong>${nombre}</strong>,</p>
                                        <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:</p>
                                        
                                        <div class="code-box">
                                            <div class="code">${codigo}</div>
                                        </div>
                                        
                                        <p style="color: #666; font-size: 14px;">
                                            Este código expirará en <strong>15 minutos</strong>.
                                        </p>
                                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                                            Si no solicitaste este código, puedes ignorar este email.
                                        </p>
                                    </div>
                                    <div class="footer">
                                        <p>© 2025 ${SENDER_NAME}. Todos los derechos reservados.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('SendGrid error:', error);
            throw new Error('Error al enviar email: ' + response.status);
        }

        return { success: true };
    } catch (error) {
        console.error('Error al enviar email:', error);
        return { success: false, error: error.message };
    }
}

// Enviar email de recuperación de contraseña con código de 6 dígitos
async function enviarCodigoRecuperacion(email, codigo, nombre = 'Usuario') {
    try {
        const apiKey = SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
        
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: email, name: nombre }],
                        subject: 'Recuperación de Contraseña - ' + SENDER_NAME
                    }
                ],
                from: {
                    email: SENDER_EMAIL,
                    name: SENDER_NAME
                },
                content: [
                    {
                        type: 'text/html',
                        value: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .container {
                                        max-width: 600px;
                                        margin: 40px auto;
                                        background-color: white;
                                        border-radius: 10px;
                                        overflow: hidden;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    }
                                    .header {
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        padding: 30px;
                                        text-align: center;
                                    }
                                    .content {
                                        padding: 40px;
                                        text-align: center;
                                    }
                                    .code-box {
                                        background-color: #fff3cd;
                                        border: 2px dashed #ffc107;
                                        border-radius: 10px;
                                        padding: 20px;
                                        margin: 30px 0;
                                    }
                                    .code {
                                        font-size: 36px;
                                        font-weight: bold;
                                        color: #ff6b6b;
                                        letter-spacing: 8px;
                                        font-family: 'Courier New', monospace;
                                    }
                                    .footer {
                                        background-color: #f8f9fa;
                                        padding: 20px;
                                        text-align: center;
                                        color: #666;
                                        font-size: 12px;
                                    }
                                    .warning {
                                        background-color: #fff3cd;
                                        border-left: 4px solid #ffc107;
                                        padding: 15px;
                                        margin: 20px 0;
                                        text-align: left;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>🔑 Recuperación de Contraseña</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hola <strong>${nombre}</strong>,</p>
                                        <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
                                        
                                        <div class="code-box">
                                            <div class="code">${codigo}</div>
                                        </div>
                                        
                                        <p style="color: #666; font-size: 14px;">
                                            Este código expirará en <strong>15 minutos</strong>.
                                        </p>
                                        
                                        <div class="warning">
                                            <strong>⚠️ Importante:</strong><br>
                                            Si no solicitaste restablecer tu contraseña, ignora este email y tu cuenta permanecerá segura.
                                        </div>
                                    </div>
                                    <div class="footer">
                                        <p>© 2025 ${SENDER_NAME}. Todos los derechos reservados.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('SendGrid error:', error);
            throw new Error('Error al enviar email: ' + response.status);
        }

        return { success: true };
    } catch (error) {
        console.error('Error al enviar email:', error);
        return { success: false, error: error.message };
    }
}

// Guardar código de verificación en Supabase
async function guardarCodigoVerificacion(supabaseClient, userId, email, codigo, tipo = 'registro') {
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15); // Expira en 15 minutos

    const { data, error } = await supabaseClient
        .from('codigos_verificacion')
        .insert([
            {
                user_id: userId,
                email: email,
                codigo: codigo,
                tipo: tipo, // 'registro' o 'recuperacion'
                expira_en: expiracion.toISOString(),
                usado: false
            }
        ]);

    if (error) {
        console.error('Error al guardar código:', error);
        return { success: false, error };
    }

    return { success: true, data };
}

// Verificar código de verificación
async function verificarCodigo(supabaseClient, email, codigo, tipo = 'registro') {
    try {
        const { data, error } = await supabaseClient
            .from('codigos_verificacion')
            .select('*')
            .eq('email', email)
            .eq('codigo', codigo)
            .eq('tipo', tipo)
            .eq('usado', false)
            .single();

        if (error || !data) {
            return { success: false, mensaje: 'Código inválido' };
        }

        // Verificar si el código ha expirado
        const ahora = new Date();
        const expiracion = new Date(data.expira_en);

        if (ahora > expiracion) {
            return { success: false, mensaje: 'Código expirado' };
        }

        // Marcar código como usado
        await supabaseClient
            .from('codigos_verificacion')
            .update({ usado: true, verificado_en: new Date().toISOString() })
            .eq('id', data.id);

        return { success: true, data };
    } catch (error) {
        console.error('Error al verificar código:', error);
        return { success: false, mensaje: 'Error al verificar código' };
    }
}
