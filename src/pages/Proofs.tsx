import React from 'react';
import { CheckCircle2, Image as ImageIcon } from 'lucide-react';

export function Proofs() {
  return (
    <div className="px-4 pt-4 pb-32 min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shadow-inner">
          <ImageIcon className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Preuves de Paiement</h1>
          <p className="text-slate-500 text-sm font-medium">Transparence et fiabilité</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">0709789499</p>
            <p className="text-slate-500 text-[11px] font-medium">Témoignage</p>
          </div>
        </div>
        <p className="text-slate-700 text-sm font-medium italic mb-3">
          "J'ai reçu mon dépôt et je pense que cette plateforme est là meilleure."
        </p>
        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
          <img src="https://i.imgur.com/XeHMi9O.jpeg" alt="Preuve de dépôt" className="w-full h-auto object-cover max-h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
