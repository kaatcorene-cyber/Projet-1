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
  const [maxWithdrawable, setMaxWithdrawable] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      const loadInfo = async () => {
        const savedInfo = localStorage.getItem('withdrawal_info_' + user.id);
        if (savedInfo) {
          try {
            const parsed = JSON.parse(savedInfo);
            if (parsed.accountNumber) {
              setWithdrawalInfo(parsed);
              // We don't early return here anymore because we need to calculate maxWithdrawable below
            }
          } catch (e) {}
        }
        
        const { data } = await supabase.from('settings').select('value').eq('key', 'bank_' + user.id).maybeSingle();
        if (data && data.value) {
           try {
             const parsed = JSON.parse(data.value);
             if (parsed.bank_account_number) {
               const info = {
                 paymentMethod: parsed.bank_method,
                 accountNumber: parsed.bank_account_number,
                 accountHolder: parsed.bank_account_name
               };
               setWithdrawalInfo(info);
               localStorage.setItem('withdrawal_info_' + user.id, JSON.stringify(info));
             }
           } catch(e) {}
        }
        
        // Fetch withdrawable max
        const { data: txs } = await supabase.from('transactions').select('type, amount, status').eq('user_id', user.id);
        let totalDeposits = 0;
        let totalInvestments = 0;
        if (txs) {
            for (const tx of txs) {
                if (tx.type === 'deposit' && tx.status === 'approved') totalDeposits += Number(tx.amount);
                if (tx.type === 'investment' && tx.status === 'completed') totalInvestments += Number(tx.amount);
            }
        }
        const uninvested = Math.max(0, totalDeposits - totalInvestments);
        const withdrawable = Math.max(0, Number(user.balance) - uninvested);
        setMaxWithdrawable(withdrawable);

        setInfoLoaded(true);
      };
      loadInfo();
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

    if (maxWithdrawable !== null && numAmount > maxWithdrawable) {
      setError('Vous ne pouvez retirer que vos gains journaliers et bonus de parrainage. Veuillez investir vos recharges.');
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
        reference: `OP:${withdrawalInfo.paymentMethod.toUpperCase()}::NOM:${withdrawalInfo.accountHolder}::NUM:${withdrawalInfo.accountNumber}`,
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


  if (!infoLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (infoLoaded && !withdrawalInfo) {
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

        <div className="bg-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-orange-600/30 relative overflow-hidden mb-6">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
           <div className="flex items-start justify-between relative z-10">
             <div>
                
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Retirable</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(maxWithdrawable !== null ? maxWithdrawable : Number(user?.balance || 0))}</h2>

             </div>
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <ArrowDownToLine className="w-5 h-5 text-white" />
             </div>
           </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Compte de retrait manquant</h2>
          <p className="text-slate-500 mb-8 text-sm">Veuillez d'abord configurer vos informations de retrait avant de pouvoir retirer vos gains.</p>
          <button onClick={() => navigate('/bank')} className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-colors">
            Configurer mon compte
          </button>
        </div>
      </div>
    );
  }


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
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Demande envoyée !</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Votre demande de retrait a été enregistrée avec succès. Vous la recevrez sur votre compte sous peu.
          </p>
          <button 
            onClick={() => navigate('/history')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-colors"
          >
            Voir l'historique
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
        {/* Balance Card matching Deposit.tsx */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-700 to-orange-600 rounded-[32px] p-6 shadow-xl shadow-orange-600/20 border border-orange-600/30 relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
               
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Retirable</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(maxWithdrawable !== null ? maxWithdrawable : Number(user?.balance || 0))}</h2>

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
           className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm font-medium flex items-start gap-3 shadow-sm"
         >
           <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
           <p>{error}</p>
         </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Compte de réception</p>
                  <p className="font-black text-slate-900 text-sm">{withdrawalInfo.paymentMethod.toUpperCase()}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{withdrawalInfo.accountNumber}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Montant à retirer</label>
                 <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                    <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-slate-900 placeholder-slate-300 outline-none"
                      placeholder="0"
                      required
                    />
                 </div>
               </div>

               {amount && Number(amount) >= 1000 && (
                 <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                     <span className="text-slate-500">Frais (10%): <span className="font-bold text-red-500">-{formatCurrency(Number(amount) * 0.10)}</span></span>
                     <span className="text-slate-500">Vous recevrez: <span className="font-bold text-green-600">{formatCurrency(Number(amount) * 0.90)}</span></span>
                 </div>
               )}

               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Mot de passe de sécurité</label>
                 <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                    <Lock className="w-5 h-5 text-slate-400 mr-3" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-slate-900 placeholder-slate-300 outline-none"
                      required
                    />
                 </div>
               </div>

               <div className="pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
                 >
                   {loading ? 'Traitement...' : 'Confirmer le retrait'}
                 </button>
               </div>
           </div>
          </form>
        </div>
      )}
    </div>
  );
}