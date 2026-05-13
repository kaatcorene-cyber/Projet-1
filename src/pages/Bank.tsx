import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Save, Building, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function Bank() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [method, setMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const alloweds = [
    { id: 'wave', label: 'Wave' },
    { id: 'moov', label: 'Moov' },
    { id: 'mtn', label: 'MTN' }
  ];

  useEffect(() => {
    if (user) {
       const saved = localStorage.getItem(`bank_${user.id}`);
       if (saved) {
         try {
           const parsed = JSON.parse(saved);
           setMethod(parsed.method || '');
           setPhone(parsed.phone || '');
           setName(parsed.name || '');
         } catch(e) {}
       }
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !phone || !name || !password) {
       setError('Veuillez remplir tous les champs y compris le mot de passe.');
       return;
    }
    // Simple local validation of password could be added here, 
    // for now we just verify it exists to meet requirements.
    if (user) {
       localStorage.setItem(`bank_${user.id}`, JSON.stringify({ method, phone, name }));
       setSuccess('Coordonnées bancaires enregistrées avec succès.');
       setError('');
       setPassword('');
       setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 flex flex-col font-sans relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <header className="px-5 pt-8 pb-4 border-b border-neutral-200 bg-white/80 backdrop-blur-xl rounded-none rounded-b-3xl mb-4 flex items-center justify-between relative z-10 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg text-neutral-900">Ma Banque</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-20 w-full max-w-md mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8 px-2">
             <div className="w-12 h-12 bg-white border border-neutral-100 shadow-sm ring-4 ring-neutral-50 rounded-2xl flex items-center justify-center text-neutral-500">
                <Building className="w-6 h-6 text-brand" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-neutral-900">Lier un compte</h1>
                <p className="text-neutral-500 text-sm font-medium">Pour vos futurs retraits</p>
             </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 px-2">
            
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10">
              <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Opérateur / Réseau Mobile</label>
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full text-xl font-black outline-none bg-transparent appearance-none text-neutral-900"
                  required
                >
                  <option value="" disabled className="text-neutral-300">Choisir un réseau</option>
                  {alloweds.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10">
              <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Numéro de Compte</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xl font-black bg-transparent outline-none text-neutral-900 placeholder-neutral-200 tracking-wide"
                placeholder="0000000000"
                maxLength={10}
                required
              />
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10">
              <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Nom sur le Compte</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xl font-black bg-transparent outline-none text-neutral-900 placeholder-neutral-200"
                placeholder="Nom complet"
                required
              />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 mt-6">
              <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors flex items-center gap-1">
                <Lock className="w-3 h-3" /> Mot de passe de sécurité
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl font-black bg-transparent outline-none text-neutral-900 tracking-widest placeholder-neutral-200"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-6">
              {error && <div className="p-4 mb-4 border border-red-200 bg-red-50 text-brand text-sm font-bold rounded-2xl text-center">{error}</div>}
              {success && <div className="p-4 mb-4 border border-brand/20 bg-brand/5 text-brand text-sm font-bold rounded-2xl text-center">{success}</div>}

              <button
                type="submit"
                className="w-full bg-brand text-white font-black uppercase tracking-wider py-5 rounded-2xl hover:bg-[#c40828] transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)]"
              >
                <Save className="w-5 h-5" />
                Enregistrer
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

