
import React from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ user }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 flex justify-between items-center px-8 shadow-sm">
        <h1 className="font-bold text-lg text-blue-600">Mi App Segura</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm font-bold text-slate-600 hover:text-red-600">Cerrar Sesión</button>
      </header>
      <main className="p-8 max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-3xl font-bold mb-4">¡Hola, bienvenido!</h2>
          <p className="text-slate-500 mb-8 text-lg">Has accedido correctamente a tu panel privado.</p>
          <div className="p-4 bg-slate-100 rounded-2xl">
            <p className="text-sm font-mono text-slate-700"><strong>Tu Email:</strong> {user.email}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
