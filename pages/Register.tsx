
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
    
    try {
      const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            emailRedirectTo: window.location.origin,
            data: {
              full_name: email.split('@')[0] // Metadata opcional
            }
          }
      });
      
      if (error) {
        if (error.status === 422) {
          setMsg('Error: Este correo ya está registrado. Intenta iniciar sesión.');
        } else {
          setMsg('Error: ' + error.message);
        }
      } else {
        setMsg('¡Éxito! Revisa tu bandeja de entrada para verificar tu correo.');
      }
    } catch (err) {
      setMsg('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Únete a nuestra comunidad segura">
      <form onSubmit={handleSignUp} className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            required 
            placeholder="correo@ejemplo.com"
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
          className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {loading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
      
      {msg && (
        <div className={`mt-4 p-3 rounded-xl text-sm font-medium border ${msg.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
          {msg}
        </div>
      )}
      
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
