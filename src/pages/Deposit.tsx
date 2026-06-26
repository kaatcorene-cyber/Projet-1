import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Recharger</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Ajouter des fonds</p>
        </div>
      </header>

      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 text-center shadow-xl animate-fade-in relative z-10">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <Info className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Patience...</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Patienter s'il vous plaît. Nous faisons quelques réglages pour vous offrir une meilleure expérience.
        </p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-zinc-800 text-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors w-full">
          Retour
        </button>
      </div>
    </div>
  );
}
