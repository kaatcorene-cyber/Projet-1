import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Wallet, ArrowDownToLine, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [withdrawalInfo, setWithdrawalInfo] = useState<{paymentMethod: string, accountNumber: string, accountHolder: string} | null>(null);
  const [infoLoaded, setInfoLoaded] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const savedInfo = localStorage.getItem('withdrawal_info_' + user.id);
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          if (parsed.accountNumber) {
            setWithdrawalInfo(parsed);
          }
        } catch (e) {}
      }
      setInfoLoaded(true);
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawalInfo) return;
    
    const numAmount = Number(amount);
    if (numAmount < 1000) {
      setError('Le montant minimum de retrait est de 1000 FCFA.');
      return;
    }
    
    if (numAmount > Number(user.balance)) {
      setError('Solde insuffisant pour ce retrait.');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data: userDoc, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();
        
      if (userError || !userDoc || userDoc.password_hash !== password) {
        throw new Error('Mot de passe incorrect.');
      }

      const newBalance = Number(user.balance) - numAmount;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `RETRAIT - ${withdrawalInfo.paymentMethod.toUpperCase()} - ${withdrawalInfo.accountNumber}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      await refreshUser();
      setSuccess(true);
      setAmount('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pt-12 pb-24 font-sans text-slate-900 max-w-lg mx-auto">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Retirer vos gains</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Retrait</h1>
        </div>
      </header>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Demande envoyée</h2>
          <p className="text-slate-500 font-medium mb-8">Votre retrait est en cours de traitement. Vous recevrez vos fonds sous peu.</p>
          <button 
            onClick={() => navigate('/invest')}
            className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      ) : infoLoaded && !withdrawalInfo ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Compte non configuré</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Veuillez renseigner vos informations de retrait dans la section "Compte de retrait" avant de pouvoir effectuer un retrait.</p>
          <button 
            onClick={() => navigate('/bank')}
            className="w-full bg-cyan-600 text-white rounded-xl py-4 font-bold shadow-xl shadow-cyan-600/20 active:scale-[0.98] transition-all"
          >
            Configurer mon compte
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Balance Card */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-br from-blue-700 to-cyan-600 rounded-[32px] p-6 shadow-xl shadow-blue-600/20 border border-blue-600/30 relative overflow-hidden text-white"
          >
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
             
             <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Disponible</p>
                  <p className="text-3xl font-black">{formatCurrency(user?.balance || 0)}</p>
               </div>
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner">
                 <Wallet className="w-6 h-6 text-white" />
               </div>
             </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-medium flex items-start gap-3 shadow-sm"
            >
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          {infoLoaded && withdrawalInfo && (
            <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-5">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Compte de réception</p>
                  <p className="font-bold text-slate-900">{withdrawalInfo.paymentMethod.toUpperCase()} - {withdrawalInfo.accountNumber}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-cyan-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Montant à retirer</label>
                 <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-cyan-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                    <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-slate-900 placeholder-slate-300 outline-none"
                      placeholder="0"
                      required
                      min="1000"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Mot de passe</label>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-slate-50 border-2 border-slate-100 focus:border-cyan-600 focus:bg-white rounded-2xl px-4 py-4 text-slate-900 font-bold placeholder-slate-300 outline-none transition-all shadow-inner"
                   placeholder="••••••••"
                   required
                 />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {loading ? 'Traitement...' : 'Demander le retrait'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
