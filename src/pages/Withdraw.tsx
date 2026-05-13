import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [bankConfig, setBankConfig] = useState<{method: string, phone: string, name: string} | null>(null);

  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`bank_${user.id}`);
      if (saved) {
        try {
          setBankConfig(JSON.parse(saved));
        } catch(e) {}
      }
    }
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!bankConfig || !bankConfig.phone) {
       return setMessage({ type: 'error', text: 'Veuillez configurer votre compte bancaire d\'abord.' });
    }

    const numAmount = Number(amount);
    
    if (numAmount < 1500) {
      return setMessage({ type: 'error', text: 'Retrait minimum : 1 500 FCFA.' });
    }

    if (Number(user?.balance) < numAmount) {
      return setMessage({ type: 'error', text: 'Solde disponible insuffisant.' });
    }

    const nowLocal = new Date();
    const gmtDay = nowLocal.getUTCDay();
    const gmtHour = nowLocal.getUTCHours();
    
    if (gmtDay === 0) {
      return setMessage({ type: 'error', text: 'Opérations de retrait suspendues le dimanche.' });
    }
    if (gmtHour < 9 || gmtHour >= 17) {
      return setMessage({ type: 'error', text: 'Fenêtre de retrait fermée. Horaires d\'ouverture : 09:00 - 17:00 GMT.' });
    }

    if (!password) {
      return setMessage({ type: 'error', text: 'Le mot de passe de sécurité est requis.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password_hash', password)
        .single();

      if (!userData) {
        setLoading(false);
        return setMessage({ type: 'error', text: 'Mot de passe incorrect.' });
      }

      const newBalance = user.balance - numAmount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

      const methodLabel = bankConfig.method.toUpperCase();

      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `${methodLabel} - ${bankConfig.phone}`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du traitement de la demande.' });
    } finally {
      setLoading(false);
    }
  };

  if (!bankConfig) {
    return (
      <div className="min-h-[100dvh] bg-white text-neutral-900 flex flex-col font-sans relative overflow-hidden">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
        </div>
        
        <header className="px-5 pt-8 pb-4 border-b border-neutral-200 bg-white/80 backdrop-blur-xl rounded-none rounded-b-3xl mb-4 flex items-center justify-between relative z-10 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 bg-neutral-100 rounded-xl border border-neutral-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg text-neutral-900">Retrait</span>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 px-6 pt-10 text-center flex flex-col items-center justify-center relative z-10">
          <div className="w-24 h-24 bg-white border border-neutral-200 shadow-sm ring-4 ring-neutral-50 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <ShieldCheck className="w-12 h-12 text-brand" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-neutral-900">Aucune Banque</h1>
          <p className="text-neutral-500 mb-8 font-medium">Vous devez lier un compte bancaire pour retirer vos fonds.</p>
          <button onClick={() => navigate('/bank')} className="w-full max-w-sm bg-brand text-white font-bold uppercase tracking-wider py-5 rounded-2xl hover:bg-[#c40828] transition-colors shadow-[0_4px_14px_0_rgba(229,9,47,0.39)]">
            Configurer ma Banque
          </button>
        </main>
      </div>
    );
  }

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
        <span className="font-bold text-lg text-neutral-900">Retrait</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 pt-8 pb-20 max-w-md mx-auto w-full relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex-1 flex flex-col"
            >
              <div className="mt-4 flex flex-col gap-4 px-2">
                
                <div className="bg-white rounded-2xl p-4 border border-neutral-200 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 shadow-sm relative group">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Montant à retirer</label>
                  <div className="flex items-center gap-3">
                     <span className="text-neutral-900 font-black text-2xl">FCFA</span>
                     <input
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       className="w-full bg-transparent text-3xl font-black outline-none placeholder-neutral-200 text-neutral-900"
                       placeholder="0"
                       min="1500"
                       autoFocus
                     />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1 block transition-colors">Compte de réception</label>
                  <div className="flex items-center justify-between text-neutral-900 py-2">
                    <span className="text-sm font-black uppercase tracking-wider">{bankConfig.method}</span>
                    <span className="text-xl font-black tracking-wide">{bankConfig.phone}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 mb-4">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Mot de passe de sécurité</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold outline-none placeholder-neutral-200 text-neutral-900 tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>

              </div>

              <div className="mt-auto px-2 pb-6">
                <div className="flex justify-between items-center bg-neutral-100 rounded-xl p-4 mb-6 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Solde Dispo.</span>
                  <span className="text-sm font-black text-neutral-900">{formatCurrency(user?.balance || 0)}</span>
                </div>

                {amount && Number(amount) >= 1500 && (
                  <div className="flex justify-between items-center bg-brand/5 rounded-xl p-4 mb-6 border border-brand/20">
                    <span className="text-[10px] text-brand font-bold uppercase tracking-wider">Montant Net (Frais 20%)</span>
                    <span className="text-lg font-black text-brand">{formatCurrency(Number(amount) * 0.80)}</span>
                  </div>
                )}

                {message?.type === 'error' && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 text-brand text-sm font-bold rounded-2xl text-center">
                    {message.text}
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={loading || !amount || !password}
                  className="w-full bg-brand text-white font-black uppercase tracking-wider py-5 rounded-2xl hover:bg-[#c40828] transition-colors disabled:opacity-50 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] disabled:shadow-none"
                >
                  {loading ? 'Traitement...' : 'Confirmer le Retrait'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 text-center mt-auto border border-neutral-200 shadow-sm"
            >
              <div className="w-24 h-24 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neutral-200">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-black mb-2 text-neutral-900">Demande Validée</h1>
              <p className="text-neutral-500 mb-8 font-medium">Votre retrait vers le compte <span className="font-bold text-neutral-900">{bankConfig.phone}</span> est en cours d'analyse et sera propagé dans les 24h ouvrées.</p>

              <button
                onClick={() => navigate('/history')}
                className="w-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-bold uppercase tracking-wider py-5 rounded-2xl hover:bg-neutral-200 transition-colors"
              >
                Voir mon historique
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
