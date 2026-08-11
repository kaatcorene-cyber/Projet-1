import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

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

      <div className="flex-1 relative flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <ImageIcon className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Aucune preuve pour le moment</h2>
        <p className="text-slate-500 text-sm">
          Les preuves de paiement apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
