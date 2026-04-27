import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Orange Money');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const availableMethods = ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const numAmount = Number(amount);
    
    if (numAmount < 1000) {
      return setMessage({ type: 'error', text: 'Le minimum de retrait est de 1 000 FCFA.' });
    }

    if (user.balance < numAmount) {
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
      // Fee is 20%, so actual amount received is amount * 0.80
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `${method} - ${phone} (Côte d'Ivoire)`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Demande de retrait envoyée. Traitement sous 24h max.' });
      setAmount('');
      setPhone('');
      setPassword('');
      setMethod(availableMethods[0] || '');
    } catch (err) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 pt-16 pb-24 font-sans">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Retrait</h1>
      </header>

      <div className="bg-white border text-center border-gray-200 rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Solde disponible</p>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{formatCurrency(user?.balance || 0)}</h2>
        <div className="mt-4 inline-flex items-center justify-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
          Frais de retrait 20%
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-center ${
            message.type === 'success' ? 'bg-green-50/80 border border-green-100 text-green-600' : 'bg-red-50 border border-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-1">
          <div className="px-3 py-2 border-b border-gray-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant à retirer (FCFA)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
              placeholder="Min: 1 000"
              required
              min="1000"
            />
          </div>
          <div className="px-3 py-2 border-b border-gray-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Opérateur Mobile</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 mt-1"
              required
            >
              {availableMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="px-3 py-2 border-b border-gray-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
              placeholder="+225 000 000"
              required
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

        {amount && Number(amount) >= 1000 && (
          <p className="text-sm font-medium text-center text-gray-500">
            Vous recevrez : <span className="font-bold text-red-600">{formatCurrency(Number(amount) * 0.80)}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-sm active:scale-[0.98]"
        >
          {loading ? 'Traitement...' : 'Confirmer le Retrait'}
        </button>
      </form>
    </div>
  );
}
