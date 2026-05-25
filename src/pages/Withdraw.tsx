import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Building2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    refreshUser();
  },[]);

  // We load bank details from user or fallback to localStorage
  let bankMethod = (user as any)?.bank_method;
  let rawAccountName = (user as any)?.bank_account_name || '';
  
  if (!bankMethod && user?.id) {
     try {
       const localDataRaw = localStorage.getItem('bank_info_' + user.id);
       if (localDataRaw) {
         const localData = JSON.parse(localDataRaw);
         if (localData.bank_method) bankMethod = localData.bank_method;
         if (localData.bank_account_name) rawAccountName = localData.bank_account_name;
       }
     } catch (e) {}
  }
  
  const bankAccountName = rawAccountName.split('|||')[0] || '';
  const bankAccountNumber = rawAccountName.split('|||')[1] || (user as any)?.phone;
  
  const hasBankConfigured = !!bankMethod && rawAccountName.includes('|||');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const numAmount = Number(amount);
    
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
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans animate-fade-in">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Retrait</h1>
      </header>

      <div className="bg-white border text-center border-gray-200 rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Solde disponible</p>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{formatCurrency(user?.balance || 0)}</h2>
        <div className="mt-4 inline-flex items-center justify-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
          Frais de retrait 10%
        </div>
      </div>

      {!hasBankConfigured ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-gray-900 font-bold mb-2">Configuration requise</h3>
          <p className="text-orange-800 text-sm mb-6">Vous devez d'abord configurer votre moyen de paiement avant de pouvoir effectuer un retrait.</p>
          <Link to="/bank" className="mx-auto px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 max-w-[200px] shadow-sm">
             <Building2 className="w-4 h-4" />
             Ma Banque
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-center ${
              message.type === 'success' ? 'bg-green-50/80 border border-green-100 text-green-600' : 'bg-purple-50 border border-purple-100 text-purple-600'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-1">
            
            <div className="px-3 py-3 border-b border-gray-100 bg-gray-50/50">
               <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Moyen de paiement</p>
               <p className="font-semibold text-gray-900">{bankMethod} • {bankAccountNumber}</p>
               <p className="text-gray-500 text-xs">{bankAccountName}</p>
            </div>

            <div className="px-3 py-2 border-b border-gray-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant à retirer (FCFA)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
                placeholder="Min: 2 000"
                required
                min="2000"
              />
            </div>
            
            <div className="px-3 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Code secret</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !password}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm"
          >
            {loading ? 'Traitement...' : 'Confirmer le retrait'}
          </button>
        </form>
      )}
    </div>
  );
}
