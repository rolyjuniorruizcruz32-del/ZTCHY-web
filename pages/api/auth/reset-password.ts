import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y contraseña son requeridos' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  try {
    // Buscar usuario con el token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      return res.status(400).json({ error: 'Token inválido' })
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expiry = new Date(user.reset_token_expiry)

    if (now > expiry) {
      return res.status(400).json({ error: 'Token expirado' })
    }

    // Actualizar contraseña en Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateAuthError) {
      return res.status(400).json({ error: updateAuthError.message })
    }

    // Limpiar token de reset
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq('id', user.id)

    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }

    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    })
  } catch (error: any) {
    console.error('Error en reset-password:', error)
    return res.status(500).json({ error: 'Error al restablecer contraseña' })
  }
}
