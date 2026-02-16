
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
        alert('Contraseña actualizada. Ya puedes iniciar sesión.');
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Nueva Contraseña</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input type="password" placeholder="Nueva contraseña" required className="w-full p-3 border rounded-xl" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Cambiar contraseña</button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
