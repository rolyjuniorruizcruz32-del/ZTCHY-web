
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/reset-password',
    });
    if (error) setMsg('Error: ' + error.message);
    else setMsg('Te hemos enviado un enlace de recuperación.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <h2 className="text-xl font-bold text-center mb-6">Recuperar Acceso</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="email" placeholder="Tu correo electrónico" className="w-full p-3 border rounded-xl" onChange={e => setEmail(e.target.value)} />
          <button className="w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition">Enviar enlace</button>
        </form>
        {msg && <p className="mt-4 text-center text-sm font-medium">{msg}</p>}
        <Link to="/login" className="block mt-6 text-center text-blue-600 text-sm">Volver al inicio</Link>
      </div>
    </div>
  );
}
