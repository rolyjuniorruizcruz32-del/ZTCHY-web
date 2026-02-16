
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: window.location.origin }
    });
    
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('¡Éxito! Revisa tu correo para activar tu cuenta.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Únete a nuestra comunidad segura">
      <form onSubmit={handleSignUp} className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            required 
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
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>
      
      {msg && (
        <p className={`mt-4 text-center p-3 rounded-lg text-sm font-medium ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {msg}
        </p>
      )}
      
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-600 font-bold">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
