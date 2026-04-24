import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      // Fee is 15%, so actual amount received is amount * 0.85
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
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Retrait</h1>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Solde disponible</p>
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(user?.balance || 0)}</h2>
        <div className="mt-4 inline-block bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100">
          Frais de retrait : 15%
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-3 rounded-xl text-sm text-center backdrop-blur-sm ${
            message.type === 'success' ? 'bg-emerald-50/80 border border-emerald-100 text-emerald-600' : 'bg-red-50/80 border border-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Montant à retirer (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            placeholder="Min: 1000"
            required
            min="1000"
          />
          {amount && Number(amount) >= 1000 && (
            <p className="text-xs font-medium text-emerald-600 ml-1 mt-1.5">
              Vous recevrez : <span className="font-bold">{formatCurrency(Number(amount) * 0.85)}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Moyen de retrait</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none"
            required
          >
            {availableMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Numéro de réception</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            placeholder="Numéro Mobile Money"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Mot de passe de connexion</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl mt-6 transition-all duration-300 disabled:opacity-50 shadow-md active:scale-95"
        >
          {loading ? 'Traitement...' : 'Demander le retrait'}
        </button>
      </form>
    </div>
  );
}
