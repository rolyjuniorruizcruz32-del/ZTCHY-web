
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            emailRedirectTo: window.location.origin,
          }
      });
      
      if (error) {
        setMsg('Error: ' + error.message);
      } else if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true);
        setMsg('¡Cuenta creada! Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para poder entrar.');
        // Aseguramos que la sesión no se mantenga si el correo no está verificado
        await supabase.auth.signOut();
      }
    } catch (err) {
      setMsg('Error inesperado al intentar registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Verificación de correo requerida">
      {!success ? (
        <form onSubmit={handleSignUp} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required 
              placeholder="tu@correo.com"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              placeholder="Mínimo 6 caracteres"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Enviando correo...' : 'Registrarse'}
          </button>
        </form>
      ) : (
        <div className="mt-6 text-center">
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 mb-6">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="font-medium text-lg mb-2 text-green-800">¡Casi listo!</p>
            <p className="text-sm">{msg}</p>
          </div>
          <Link to="/login" className="text-indigo-600 font-bold hover:underline text-sm">Ir al inicio de sesión</Link>
        </div>
      )}
      
      {msg && !success && (
        <p className="mt-4 text-center p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100">
          {msg}
        </p>
      )}
      
      {!success && (
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      )}
    </AuthLayout>
  );
}
