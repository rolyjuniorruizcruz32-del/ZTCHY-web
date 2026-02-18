import { supabaseAdmin } from '../../../lib/supabase'
import { sendVerificationEmail } from '../../../lib/email'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { action, email, password, name, code, newPassword } = req.body
  const admin = supabaseAdmin()

  // ── REGISTER ──────────────────────────────────────────────
  if (action === 'register') {
    const { data: existing } = await admin
      .from('pending_users')
      .select('id')
      .eq('email', email)
      .single()

    const verificationCode = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    if (existing) {
      await admin
        .from('pending_users')
        .update({ code: verificationCode, expires_at: expiresAt, password, name })
        .eq('email', email)
    } else {
      await admin.from('pending_users').insert({ email, password, name, code: verificationCode, expires_at: expiresAt })
    }

    await sendVerificationEmail(email, verificationCode)
    return res.status(200).json({ ok: true })
  }

  // ── VERIFY EMAIL ──────────────────────────────────────────
  if (action === 'verify') {
    const { data: pending, error } = await admin
      .from('pending_users')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (error || !pending) return res.status(400).json({ error: 'Código inválido' })
    if (new Date(pending.expires_at) < new Date()) return res.status(400).json({ error: 'Código expirado' })

    const { error: signUpError } = await admin.auth.admin.createUser({
      email: pending.email,
      password: pending.password,
      email_confirm: true,
      user_metadata: { name: pending.name },
    })

    if (signUpError) return res.status(400).json({ error: signUpError.message })

    await admin.from('pending_users').delete().eq('email', email)
    return res.status(200).json({ ok: true })
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────
  if (action === 'forgot') {
    const { data: user } = await admin.auth.admin.listUsers()
    const found = user?.users?.find(u => u.email === email)
    if (!found) return res.status(400).json({ error: 'Correo no registrado' })

    const resetCode = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    await admin.from('reset_codes').upsert({ email, code: resetCode, expires_at: expiresAt }, { onConflict: 'email' })
    await sendPasswordResetEmail(email, resetCode)
    return res.status(200).json({ ok: true })
  }

  // ── RESET PASSWORD ────────────────────────────────────────
  if (action === 'reset') {
    const { data: record, error } = await admin
      .from('reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (error || !record) return res.status(400).json({ error: 'Código inválido' })
    if (new Date(record.expires_at) < new Date()) return res.status(400).json({ error: 'Código expirado' })

    const { data: users } = await admin.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' })

    await admin.auth.admin.updateUserById(user.id, { password: newPassword })
    await admin.from('reset_codes').delete().eq('email', email)
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Acción no válida' })
}
