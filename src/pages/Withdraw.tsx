import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Wallet, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';

const availableMethods = [
  { id: 'orange', name: 'Orange Money' },
  { id: 'mtn', name: 'MTN Mobile Money' },
  { id: 'moov', name: 'Moov Money' },
  { id: 'wave', name: 'Wave' },
  { id: 'bank', name: 'Virement Bancaire' },
  { id: 'crypto', name: 'Cryptomonnaie' },
];

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [success, setSuccess] = useState(false);
  
  const [withdrawalInfo, setWithdrawalInfo] = useState<{paymentMethod: string, accountNumber: string, accountHolder: string} | null>(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [maxWithdrawable, setMaxWithdrawable] = useState<number | null>(null);
  const [hasActivePack, setHasActivePack] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.id) {
      const loadInfo = async () => {
        let hasLocalData = false;
        const savedInfo = localStorage.getItem('withdrawal_info_v4_' + user.id);
        if (savedInfo) {
          try {
            const parsed = JSON.parse(savedInfo);
            if (parsed.accountNumber) {
              setWithdrawalInfo({
                ...parsed,
                paymentMethod: parsed.paymentMethod || parsed.bank_method || parsed.bank_name || 'orange'
              });
              hasLocalData = true;
            }
          } catch (e) {}
        }
        
        if (!hasLocalData) {
          const { data } = await supabase.from('settings').select('value').eq('key', `bank_${user.id}`).maybeSingle();
            if (data && data.value) {
              try {
                const parsed = JSON.parse(data.value);
                if (parsed.bank_account_number) {
                  setWithdrawalInfo({
                    paymentMethod: parsed.bank_method || parsed.paymentMethod || parsed.bank_name || 'orange',
                    accountNumber: parsed.bank_account_number,
                    accountHolder: parsed.bank_account_name || user.first_name || ''
                  });
                }
              } catch(e) {}
            }
        }

        const { data: txData } = await supabase
          .from('transactions')
          .select('amount, status, type')
          .eq('user_id', user.id);

        let totalEarnings = 0;
        let pendingWithdrawals = 0;

        if (txData) {
           txData.forEach(tx => {
             if (tx.status === 'approved' && (tx.type === 'daily_revenue' || tx.type === 'referral_bonus' || tx.type === 'admin_bonus')) {
               totalEarnings += Number(tx.amount);
             }
             if (tx.type === 'withdrawal' && tx.status === 'pending') {
               pendingWithdrawals += Number(tx.amount);
             }
           });
        }
        const available = Math.max(0, totalEarnings - pendingWithdrawals);
        
        setMaxWithdrawable(Math.min(available, Number(user.balance)));

        // Check for active pack
        const { data: invData } = await supabase.from('investments').select('id').eq('user_id', user.id);
        setHasActivePack(invData && invData.length > 0);

        setInfoLoaded(true);
      };
      loadInfo();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!user || !withdrawalInfo) return;

    if (!amount || Number(amount) < 1000) {
      setError('Le montant minimum de retrait est de 1000 FCFA.');
      return;
    }
    
    if (hasActivePack === false) {
       setError('Vous devez avoir acheté au moins un pack actif avant de pouvoir retirer vos gains.');
       return;
    }

    // removed maxWithdrawable check

    if (Number(amount) > Number(user.balance)) {
      setError('Solde insuffisant.');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe pour confirmer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: passData, error: passError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password_hash', password.trim())
        .single();

      if (passError || !passData) throw new Error('Mot de passe incorrect.');

      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: Number(amount),
        status: 'pending',
        reference: `Retrait vers ${withdrawalInfo.paymentMethod} (${withdrawalInfo.accountNumber})`
      }]);

      if (txError) throw txError;

      const newBalance = Number(user.balance) - Number(amount);
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la demande de retrait.');
    } finally {
      setLoading(false);
    }
  };

  if (!infoLoaded) {
    return <div className="min-h-[100dvh] bg-[#03296c] flex items-center justify-center"></div>;
  }

  if (!withdrawalInfo) {
    return (
      <div className="min-h-[100dvh] bg-[#03296c] p-4 pt-10 pb-32 font-sans text-white relative">
        <header className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors shadow-sm shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Retrait</h1>
            <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Configuration requise</p>
          </div>
        </header>

        <div className="max-w-md mx-auto bg-white/10 rounded-3xl p-8 text-center shadow-sm border border-white/20">
          <div className="w-16 h-16 bg-[#03296c] border border-white/20 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Compte de retrait manquant</h2>
          <p className="text-blue-200/60 mb-8 text-sm">Veuillez d'abord configurer vos informations de retrait avant de pouvoir retirer vos gains.</p>
          <button onClick={() => navigate('/bank')} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all">
            Configurer mon compte
          </button>
        </div>
      </div>
    );
  }

  if (hasActivePack === false) {
    return (
      <div className="min-h-[100dvh] bg-[#03296c] p-4 pt-10 pb-32 font-sans text-white relative">
        <header className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors shadow-sm shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Retrait bloqué</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto bg-white/10 rounded-3xl p-8 text-center shadow-sm border border-white/20">
          <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Achat de pack requis</h2>
          <p className="text-blue-200/60 mb-8 text-sm">Vous devez avoir acheté au moins un pack actif avant de pouvoir retirer vos gains.</p>
          <button onClick={() => navigate('/products')} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all">
            Voir les packs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#03296c] p-4 pt-10 pb-32 font-sans text-white relative">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Retrait</h1>
          <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Retirer vos gains</p>
        </div>
      </header>

      <div className="max-w-md mx-auto space-y-6">
      
      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 rounded-3xl p-8 text-center shadow-sm border border-white/20"
        >
          <div className="w-20 h-20 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <CheckCircle2 className="w-10 h-10 text-brand-500 relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Demande envoyée !</h2>
          <p className="text-blue-200/60 text-sm mb-8 leading-relaxed">
            Votre demande de retrait a été enregistrée avec succès. Vous la recevrez sur votre compte sous peu.
          </p>
          <button 
            onClick={() => navigate('/history')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-slate-900/20"
          >
            Voir l'historique
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
        
        {/* Balance Card */}
        <div className="bg-brand-500 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
               <p className="text-brand-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Retirable</p>
               <h2 className="text-3xl font-black tracking-tight">{formatCurrency(Number(user?.balance || 0))}</h2>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
               <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {error && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3 shadow-sm"
         >
           <Info className="w-5 h-5 shrink-0 mt-0.5" />
           <p>{error}</p>
         </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/10 rounded-3xl p-5 shadow-sm border border-white/20 space-y-6">
          
          <div className="bg-[#03296c] p-4 rounded-2xl border border-white/20 flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Compte de réception</p>
              <p className="font-black text-white text-sm">{availableMethods.find(m => m.id === withdrawalInfo.paymentMethod)?.name.toUpperCase() || withdrawalInfo.paymentMethod.toUpperCase()}</p>
              <p className="text-xs text-blue-200/60 font-mono mt-0.5">{withdrawalInfo.accountNumber}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-white/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
           
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-blue-200/60 px-1">Montant à retirer</label>
             <div className="bg-[#03296c] border border-white/20 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-white placeholder-slate-300 outline-none"
                  placeholder="0"
                  required
                />
             </div>
           </div>

           {amount && Number(amount) >= 1000 && (
             <div className="px-4 py-3 bg-[#03296c] rounded-xl border border-white/20 flex justify-between items-center text-xs">
                 <span className="text-blue-200/60 font-medium">Frais (15%): <span className="font-bold text-red-500">-{formatCurrency(Number(amount) * 0.15)}</span></span>
                 <span className="text-blue-200/60 font-medium">Vous recevrez: <span className="font-bold text-brand-600">{formatCurrency(Number(amount) * 0.85)}</span></span>
             </div>
           )}
           
           <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-blue-200/60 px-1">Mot de passe</label>
             <div className="bg-[#03296c] border border-white/20 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                <Lock className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-white placeholder-slate-300 outline-none tracking-widest"
                  required
                />
             </div>
           </div>
           
           <div className="pt-2">
             <button
               type="submit"
               disabled={loading}
               className="w-full py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
             >
               {loading ? 'Traitement...' : 'Confirmer le retrait'}
             </button>
           </div>
           
           <div className="flex items-center justify-center gap-1.5 text-slate-400">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Transaction Sécurisée</span>
          </div>
       </form>
      </div>
      )}
      </div>
    </div>
  );
}
