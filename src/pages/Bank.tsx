import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Bank() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { 
    refreshUser(); 
  }, []);

  useEffect(() => {
    if (user?.id) {
      const savedInfo = localStorage.getItem('withdrawal_info_' + user.id);
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          if (parsed.accountNumber) {
            setPaymentMethod(parsed.paymentMethod || 'wave');
            setAccountNumber(parsed.accountNumber || '');
            setAccountHolder(parsed.accountHolder || '');
            setIsSaved(true);
          }
        } catch (e) {}
      }
    }
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (isSaved) {
      // Allow editing maybe? The prompt says "se verrouiller automatiquement", so we don't do anything if saved.
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const { data: userDoc, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();
        
      if (userError || !userDoc || userDoc.password_hash !== password) {
        throw new Error('Mot de passe incorrect.');
      }
      
      localStorage.setItem('withdrawal_info_' + user.id, JSON.stringify({
        paymentMethod,
        accountNumber,
        accountHolder
      }));
      setIsSaved(true);
      
      setMessage({ 
        type: 'success', 
        text: 'Vos informations de retrait ont été enregistrées avec succès.' 
      });
      setPassword('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 pt-12 pb-32 min-h-screen bg-slate-50 max-w-lg mx-auto font-sans">
      <div className="relative mb-10 text-center">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-600/10 rounded-full blur-[40px] pointer-events-none"></div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">COMPTE DE RETRAIT</h1>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl mb-6 flex items-center gap-3 border shadow-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-800 border-blue-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      {isSaved && !message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl mb-6 flex items-start gap-3 border shadow-sm bg-blue-50 text-blue-800 border-blue-100"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
          <p className="text-sm font-semibold leading-relaxed">
            Vos informations de retrait sont configurées et verrouillées. Vous pouvez maintenant effectuer vos retraits depuis la page de retrait.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
        
        <div className="space-y-4">
           {/* Moyen de paiement */}
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Moyen de paiement</label>
             <select 
               value={paymentMethod}
               onChange={(e) => setPaymentMethod(e.target.value)}
               disabled={isSaved}
               className={`w-full border-2 rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none transition-all shadow-inner appearance-none ${isSaved ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-cyan-600 focus:bg-white'}`}
             >
               <option value="wave">Wave</option>
               <option value="orange">Orange Money</option>
               <option value="mtn">MTN Mobile Money</option>
               <option value="moov">Moov Money</option>
             </select>
           </div>

           {/* Numéro du compte de réception */}
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Numéro du compte de réception</label>
             <input
               type="tel"
               value={accountNumber}
               onChange={(e) => setAccountNumber(e.target.value)}
               disabled={isSaved}
               className={`w-full border-2 rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-300 outline-none transition-all shadow-inner ${isSaved ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-cyan-600 focus:bg-white'}`}
               placeholder="Ex: 0102030405"
               required
             />
           </div>

           {/* Nom du titulaire */}
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Nom du titulaire (si différent)</label>
             <input
               type="text"
               value={accountHolder}
               onChange={(e) => setAccountHolder(e.target.value)}
               disabled={isSaved}
               className={`w-full border-2 rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-300 outline-none transition-all shadow-inner ${isSaved ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-cyan-600 focus:bg-white'}`}
               placeholder="Nom complet"
             />
           </div>

           {/* Mot de passe */}
           {!isSaved && (
             <div className="space-y-2">
               <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Mot de passe de confirmation</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-600 focus:bg-white rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-300 outline-none transition-all shadow-inner"
                 placeholder="••••••••"
                 required
               />
             </div>
           )}
        </div>

        {!isSaved && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer les informations'}
          </button>
        )}
      </form>
    </div>
  );
}
