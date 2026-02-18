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

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Token es requerido' })
  }

  try {
    // Buscar usuario con el token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (userError || !user) {
      return res.status(400).json({ error: 'Token inválido' })
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expiry = new Date(user.verification_token_expiry)

    if (now > expiry) {
      return res.status(400).json({ error: 'Token expirado' })
    }

    // Verificar si ya está verificado
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email ya verificado' })
    }

    // Actualizar usuario como verificado
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expiry: null,
      })
      .eq('id', user.id)

    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }

    return res.status(200).json({
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
    })
  } catch (error: any) {
    console.error('Error en verificación:', error)
    return res.status(500).json({ error: 'Error al verificar email' })
  }
}
