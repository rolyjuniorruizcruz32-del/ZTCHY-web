# Sistema de Login con HTML + Supabase

Sistema completo de autenticación usando HTML puro y Supabase como backend. No requiere servidor PHP ni Node.js.

## 🌟 Características

- ✅ HTML puro (sin frameworks)
- ✅ Supabase como backend (gratis hasta 500MB)
- ✅ Autenticación con email y contraseña
- ✅ Verificación de email automática
- ✅ Base de datos PostgreSQL en la nube
- ✅ Row Level Security (RLS)
- ✅ Diseño responsive y moderno
- ✅ Se puede hospedar en cualquier sitio estático

## 📋 Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página de inicio de sesión |
| `registro.html` | Formulario de registro |
| `dashboard.html` | Panel de usuario (requiere login) |
| `config.js` | Configuración de Supabase (EDITAR) |
| `supabase-setup.sql` | Script para configurar la base de datos |

## 🚀 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta (gratis)
4. Crea un nuevo proyecto:
   - **Nombre del proyecto:** mi-sistema-login (o el que quieras)
   - **Database Password:** Elige una contraseña segura (guárdala)
   - **Region:** Elige la más cercana a ti
   - **Pricing Plan:** Free (gratis)
5. Espera 1-2 minutos mientras se crea el proyecto

## 🔧 Paso 2: Configurar Supabase

### 2.1 Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) → **API**
2. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (es una clave larga que empieza con `eyJ...`)

### 2.2 Configurar config.js

Edita el archivo `config.js` y reemplaza estos valores:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // ← Pega tu Project URL aquí
const SUPABASE_KEY = 'tu-anon-key-aqui'; // ← Pega tu anon public key aquí
```

### 2.3 Configurar la base de datos

1. En Supabase, ve a **SQL Editor** (icono de base de datos)
2. Haz clic en **New query**
3. Copia TODO el contenido del archivo `supabase-setup.sql`
4. Pégalo en el editor
5. Haz clic en **Run** (o presiona Ctrl+Enter)
6. Deberías ver: "Success. No rows returned"

### 2.4 Configurar la autenticación

1. Ve a **Authentication** → **Providers**
2. Busca **Email**
3. Asegúrate de que esté HABILITADO
4. Configuración recomendada:
   - **Enable email confirmations:** ✅ Activado (los usuarios deben confirmar su email)
   - **Enable email change confirmations:** ✅ Activado
   - **Secure email change:** ✅ Activado

### 2.5 Configurar plantillas de email (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Aquí puedes personalizar los emails que Supabase envía:
   - **Confirm signup:** Email de confirmación de registro
   - **Magic Link:** Link mágico para login sin contraseña
   - **Change Email Address:** Confirmación de cambio de email
   - **Reset Password:** Recuperación de contraseña

## 📤 Paso 3: Subir tu Sitio

Tienes varias opciones para hospedar tu sitio (todas gratis):

### Opción A: GitHub Pages (Recomendado)

1. Crea un repositorio en GitHub
2. Sube todos los archivos HTML y JS
3. Ve a **Settings** → **Pages**
4. Selecciona la rama `main` y carpeta `/ (root)`
5. Guarda y espera 1-2 minutos
6. Tu sitio estará en: `https://tu-usuario.github.io/nombre-repo`

### Opción B: Netlify

1. Ve a [https://netlify.com](https://netlify.com)
2. Crea una cuenta
3. Arrastra la carpeta de tu proyecto a Netlify
4. ¡Listo! Tu sitio estará online en segundos

### Opción C: Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Crea una cuenta
3. Importa desde GitHub o arrastra tu carpeta
4. Deploy automático

### Opción D: Cualquier hosting HTML

Solo necesitas subir los archivos `.html` y `.js` por FTP. Funciona en cualquier hosting que soporte HTML estático.

## 🎯 Paso 4: Probar el Sistema

1. Abre tu sitio (la URL de GitHub Pages, Netlify, etc.)
2. Haz clic en "¿No tienes cuenta? Regístrate aquí"
3. Completa el formulario de registro
4. **IMPORTANTE:** Revisa tu email para confirmar la cuenta
5. Haz clic en el link de confirmación en el email
6. Vuelve a tu sitio e inicia sesión

## 🔒 Seguridad

El sistema incluye:

- ✅ Autenticación JWT de Supabase
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Row Level Security (RLS) - los usuarios solo ven sus datos
- ✅ Verificación de email obligatoria
- ✅ HTTPS automático en GitHub Pages/Netlify/Vercel
- ✅ CORS configurado automáticamente

## ⚙️ Configuración Avanzada

### Desactivar confirmación de email (no recomendado)

Si quieres que los usuarios puedan iniciar sesión sin confirmar su email:

1. En Supabase, ve a **Authentication** → **Providers** → **Email**
2. Desactiva "Enable email confirmations"

### Agregar campos personalizados al perfil

1. Edita `supabase-setup.sql` y agrega columnas:
```sql
ALTER TABLE public.perfiles ADD COLUMN telefono TEXT;
ALTER TABLE public.perfiles ADD COLUMN fecha_nacimiento DATE;
```

2. Ejecuta el SQL en Supabase

3. Edita `registro.html` para capturar esos datos

4. Actualiza el INSERT en el JavaScript

### Recuperación de contraseña

Supabase incluye recuperación de contraseña automática:

1. En `index.html`, agrega un link:
```html
<a href="#" onclick="recuperarPassword()">¿Olvidaste tu contraseña?</a>
```

2. Agrega la función JavaScript:
```javascript
async function recuperarPassword() {
    const email = prompt('Ingresa tu email:');
    if (email) {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Revisa tu email para restablecer tu contraseña');
        }
    }
}
```

## 🎨 Personalización

### Cambiar los colores

En cada archivo HTML, busca:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Y cámbialo por tus colores favoritos.

### Agregar logo

En el `.login-header`, agrega:
```html
<img src="tu-logo.png" alt="Logo" style="width: 80px; margin-bottom: 20px;">
```

## 📊 Ver tus Datos

En Supabase:

1. Ve a **Table Editor**
2. Selecciona la tabla `perfiles`
3. Verás todos los usuarios registrados

## ⚠️ Solución de Problemas

### "Invalid API key"
- Verifica que copiaste correctamente el `SUPABASE_URL` y `SUPABASE_KEY`
- Asegúrate de usar la **anon public** key, no la service key

### "No se puede conectar a Supabase"
- Verifica que tu proyecto de Supabase esté activo
- Comprueba la URL del proyecto

### "Email not confirmed"
- El usuario debe confirmar su email antes de poder iniciar sesión
- Revisa la bandeja de spam
- O desactiva la confirmación de email en Supabase

### Los usuarios no se guardan en la tabla perfiles
- Verifica que ejecutaste el `supabase-setup.sql` completo
- Revisa que el trigger `on_auth_user_created` esté creado

### Error CORS
- Esto no debería pasar con Supabase
- Si pasa, asegúrate de estar usando HTTPS en tu sitio

## 💰 Límites del Plan Gratuito de Supabase

- 500 MB de base de datos
- 1 GB de almacenamiento de archivos
- 2 GB de ancho de banda
- 50,000 usuarios activos mensuales

¡Más que suficiente para empezar!

## 📱 Próximos Pasos

- Agregar OAuth (Google, GitHub, etc.)
- Implementar roles de usuario
- Agregar perfil editable
- Crear sistema de roles y permisos
- Agregar 2FA (autenticación de dos factores)

## 🆘 Soporte

- Documentación oficial de Supabase: https://supabase.com/docs
- Discord de Supabase: https://discord.supabase.com

## 📄 Licencia

Código libre para uso personal y comercial.

---

**¡Tu sistema de login está listo!** 🎉

¿Necesitas ayuda? Abre un issue o contacta al soporte de Supabase.