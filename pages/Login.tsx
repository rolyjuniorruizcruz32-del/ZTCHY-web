
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError('Credenciales incorrectas o correo no verificado.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bienvenido" subtitle="Ingresa tus credenciales para acceder">
      <form onSubmit={handleLogin} className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            placeholder="ejemplo@correo.com" 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            onChange={e => setEmail(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            onChange={e => setPassword(e.target.value)} 
            required
          />
        </div>
        
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
      
      <div className="mt-6 text-center space-y-3">
          <Link to="/forgot-password" title="sm" className="block text-sm text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</Link>
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta? <Link to="/register" className="text-indigo-600 font-bold">Regístrate gratis</Link>
          </p>
      </div>
    </AuthLayout>
  );
}
