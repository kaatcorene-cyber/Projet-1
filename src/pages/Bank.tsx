import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, ChevronLeft, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const availableMethods = [
  { id: 'orange', name: 'Orange Money' },
  { id: 'mtn', name: 'MTN Mobile Money' },
  { id: 'moov', name: 'Moov Money' },
  { id: 'wave', name: 'Wave' },
  { id: 'bank', name: 'Virement Bancaire' },
  { id: 'crypto', name: 'Cryptomonnaie' },
];

export function Bank() {
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState(availableMethods[0].id);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    if (user?.id) {
      const loadInfo = async () => {
        const savedInfo = localStorage.getItem('withdrawal_info_' + user.id);
        if (savedInfo) {
          try {
            const parsed = JSON.parse(savedInfo);
            if (parsed.accountNumber) {
              setPaymentMethod(parsed.paymentMethod || parsed.bank_method || parsed.bank_name || availableMethods[0].id);
              setAccountNumber(parsed.accountNumber || '');
              setAccountHolder(parsed.accountHolder || '');
              setIsSaved(true);
              return;
            }
          } catch (e) {}
        }
        
        const { data: userData } = await supabase.from('users').select('bank_method, bank_account_number, bank_account_name').eq('id', user.id).single();
        if (userData && userData.bank_account_number) {
            setPaymentMethod(userData.bank_method || availableMethods[0].id);
            setAccountNumber(userData.bank_account_number || '');
            setAccountHolder(userData.bank_account_name || '');
            setIsSaved(true);
            localStorage.setItem('withdrawal_info_' + user.id, JSON.stringify({
              paymentMethod: userData.bank_method,
              accountNumber: userData.bank_account_number,
              accountHolder: userData.bank_account_name
            }));
            return;
        }
        
        const { data } = await supabase.from('settings').select('value').eq('key', 'bank_' + user.id).maybeSingle();
        
        if (data && data.value) {
           try {
             const parsed = JSON.parse(data.value);
             if (parsed.bank_account_number) {
               setPaymentMethod(parsed.bank_method || parsed.paymentMethod || parsed.bank_name || availableMethods[0].id);
               setAccountNumber(parsed.bank_account_number || '');
               setAccountHolder(parsed.bank_account_name || '');
               setIsSaved(true);
               
               localStorage.setItem('withdrawal_info_' + user.id, JSON.stringify({
                 paymentMethod: parsed.bank_method || parsed.paymentMethod || parsed.bank_name,
                 accountNumber: parsed.bank_account_number,
                 accountHolder: parsed.bank_account_name
               }));
               return;
             }
           } catch(e) {}
        }
        
        setPaymentMethod(availableMethods[0].id);
      };
      
      loadInfo();
    }
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (isSaved) {
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
      
      await supabase.from('users').update({
        bank_method: paymentMethod,
        bank_account_number: accountNumber,
        bank_account_name: accountHolder
      }).eq('id', user.id);
      
      // Also try to save to settings just in case
      await supabase.from('settings').upsert({
        key: 'bank_' + user.id,
        value: JSON.stringify({ 
           bank_method: paymentMethod,
           bank_account_number: accountNumber,
           bank_account_name: accountHolder
        })
      });
      
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
    <div className="px-5 pt-12 pb-32 min-h-[100dvh] bg-slate-50 max-w-lg mx-auto font-sans relative text-slate-900">
      <header className="flex items-center gap-4 mb-8 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-700 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Compte de Retrait</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Configurer</p>
        </div>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border shadow-sm backdrop-blur-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm font-semibold leading-relaxed">{message.text}</p>
        </motion.div>
      )}

      {isSaved && !message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl mb-6 flex items-start gap-3 border shadow-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-sm"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed mb-3">
              Vos informations de retrait sont configurées et verrouillées. Vous pouvez maintenant effectuer vos retraits depuis la page de retrait.
            </p>
            <button
              onClick={() => setIsSaved(false)}
              className="text-xs font-bold bg-white text-emerald-600 px-4 py-2 rounded-xl shadow-sm border border-emerald-500/20 active:scale-95 transition-transform"
            >
              Modifier mes informations
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-slate-200/50 border border-slate-200/50 space-y-6 relative z-10">
        
        <div className="space-y-4">
           {/* Moyen de paiement */}
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Moyen de paiement</label>
             <select
               value={paymentMethod}
               onChange={(e) => setPaymentMethod(e.target.value)}
               disabled={isSaved}
               className={`w-full border rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none transition-all shadow-inner appearance-none ${isSaved ? 'bg-white/50 border-slate-200/50 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`}
             >
               {availableMethods.map(method => (
                 <option key={method.id} value={method.id} className="bg-white">{method.name}</option>
               ))}
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
               className={`w-full border rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-600 outline-none transition-all shadow-inner ${isSaved ? 'bg-white/50 border-slate-200/50 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`}
               placeholder="Ex: 0102030405"
               required
             />
           </div>
           
           {/* Nom du titulaire */}
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Nom du titulaire</label>
             <input
               type="text"
               value={accountHolder}
               onChange={(e) => setAccountHolder(e.target.value)}
               disabled={isSaved}
               className={`w-full border rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-600 outline-none transition-all shadow-inner ${isSaved ? 'bg-white/50 border-slate-200/50 text-slate-500 opacity-80 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`}
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
                 className="w-full bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-600 outline-none transition-all shadow-inner tracking-widest"
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
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-slate-900 bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-6"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : 'Enregistrer les informations'}
          </button>
        )}
      </form>
    </div>
  );
}
