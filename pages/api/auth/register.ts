import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendVerificationEmail } from '@/lib/sendgrid'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' })
  }

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' })
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Expira en 24 horas

    // Guardar información del usuario en la tabla personalizada
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name: name || '',
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expiry: tokenExpiry.toISOString(),
      })

    if (insertError) {
      // Si falla, eliminar el usuario de Auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: insertError.message })
    }

    // Enviar email de verificación
    await sendVerificationEmail(email, verificationToken)

    return res.status(200).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
    })
  } catch (error: any) {
    console.error('Error en registro:', error)
    return res.status(500).json({ error: 'Error al registrar usuario' })
  }
}
