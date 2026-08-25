import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Building2, CreditCard, Lock, ArrowRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [bankMethod, setBankMethod] = useState('');
  const [rawAccountName, setRawAccountName] = useState('');
  const [isBankLoaded, setIsBankLoaded] = useState(false);

  useEffect(() => {
    refreshUser();
  },[]);

  useEffect(() => {
    const loadBank = async () => {
      if (!user?.id) return;
      try {
        let method = (user as any)?.bank_method;
        let accountName = (user as any)?.bank_account_name;
        
        if (!method || !accountName) {
          const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'bank_' + user.id).maybeSingle();
          if (settingData?.value) {
            try {
              const parsed = JSON.parse(settingData.value);
              method = parsed.bank_method;
              accountName = parsed.bank_account_name;
            } catch(e) {}
          }
        }
        setBankMethod(method || '');
        setRawAccountName(accountName || '');
      } catch (err) {
        console.error("Error loading bank settings:", err);
      } finally {
        setIsBankLoaded(true);
      }
    };
    loadBank();
  }, [user]);

  const bankAccountName = rawAccountName.split('|||')[0] || '';
  const bankAccountNumber = rawAccountName.split('|||')[1] || (user as any)?.phone;
  
  const hasBankConfigured = !!bankMethod && rawAccountName.includes('|||');

  const numAmount = Number(amount);
  const feeAmount = numAmount > 0 ? numAmount * 0.15 : 0;
  const netAmount = numAmount > 0 ? numAmount - feeAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (numAmount < 2000) {
      return setMessage({ type: 'error', text: 'Le minimum de retrait est de 2 000 FCFA.' });
    }

    if (Number(user.balance) < numAmount) {
      return setMessage({ type: 'error', text: 'Solde insuffisant.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      // Verify password
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

      // Deduct balance immediately (pending state)
      const newBalance = user.balance - numAmount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

      // Create withdrawal request
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `${bankMethod} - ${bankAccountNumber} (${bankAccountName})`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Demande de retrait envoyée. Traitement sous 24h max.' });
      setAmount('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans animate-fade-in text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Retrait</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Retirer des fonds</p>
        </div>
      </header>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 shadow-lg border border-red-500/30 mb-8 relative overflow-hidden">
         {/* Glows */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -mr-8 -mt-8 pointer-events-none"></div>
         
         <div className="flex items-start justify-between relative z-10 mb-4">
           <div>
              <p className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Solde disponible</p>
              <h2 className="text-3xl font-black text-white">{formatCurrency(user?.balance || 0)}</h2>
           </div>
           <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
             <Wallet className="w-6 h-6 text-red-100" />
           </div>
         </div>
         
         <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/20 border border-white/10 text-red-50 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm relative z-10">
           <AlertCircle className="w-3.5 h-3.5" />
           Frais de retrait : 15%
         </div>
      </div>

      {!isBankLoaded ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-red-500 animate-spin"></div></div>
      ) : !hasBankConfigured ? (
        <div className="bg-zinc-900/50 border border-orange-500/20 rounded-3xl p-8 text-center backdrop-blur-sm">
          <div className="mx-auto w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Moyen de paiement manquant</h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Pour des raisons de sécurité, veuillez configurer et vérifier votre compte de réception avant d'effectuer un retrait.
          </p>
          <Link to="/bank" className="inline-flex h-12 w-full max-w-[240px] items-center justify-center gap-2 rounded-xl bg-zinc-50 px-6 font-bold text-zinc-900 transition-colors hover:bg-zinc-200 active:scale-95">
             <CreditCard className="w-4 h-4" />
             Configurer ma banque
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{message.text}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Bank Info */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 border border-zinc-700/50">
                <Building2 className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Compte de réception</p>
                <p className="font-bold text-sm truncate">{bankMethod} • {bankAccountNumber}</p>
                <p className="text-zinc-400 text-xs truncate">{bankAccountName}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl p-4 transition-all duration-300">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-2 px-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Montant à retirer
              </label>
              <div className="flex items-center px-1">
                <span className="text-zinc-500 font-bold text-2xl mr-3">FCFA</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-zinc-50 placeholder-zinc-700 outline-none"
                  placeholder="0"
                  required
                  min="2000"
                />
              </div>
            </div>

            {/* Fee Calculation Breakdown */}
            {numAmount > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Montant brut</span>
                  <span className="font-semibold text-zinc-300">{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Frais (15%)</span>
                  <span className="font-bold text-red-400">-{formatCurrency(feeAmount)}</span>
                </div>
                <div className="h-px w-full bg-zinc-800 my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-50">Vous recevez</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(netAmount)}</span>
                </div>
              </div>
            )}
            
            {/* Password Input */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl p-4 transition-all duration-300">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-2 px-1">
                <Lock className="w-3.5 h-3.5" />
                Code secret
              </label>
              <div className="px-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-2xl font-black text-zinc-50 placeholder-zinc-700 outline-none tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !password}
            className="w-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] border border-red-500/50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirmer le retrait</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

