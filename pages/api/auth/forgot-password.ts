import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/sendgrid'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' })
  }

  try {
    // Buscar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // Siempre retornar éxito por seguridad (no revelar si el email existe)
    if (userError || !user) {
      return res.status(200).json({
        message: 'Si el email existe, recibirás un correo con instrucciones.',
      })
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 1) // Expira en 1 hora

    // Guardar token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: tokenExpiry.toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error al guardar token:', updateError)
      return res.status(200).json({
        message: 'Si el email existe, recibirás un correo con instrucciones.',
      })
    }

    // Enviar email
    await sendPasswordResetEmail(email, resetToken)

    return res.status(200).json({
      message: 'Si el email existe, recibirás un correo con instrucciones.',
    })
  } catch (error: any) {
    console.error('Error en forgot-password:', error)
    return res.status(200).json({
      message: 'Si el email existe, recibirás un correo con instrucciones.',
    })
  }
}
