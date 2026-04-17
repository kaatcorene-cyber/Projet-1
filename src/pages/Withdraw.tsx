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
  const [country, setCountry] = useState('Benin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

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
      // Fee is 20%, so actual amount received is amount * 0.8
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `To: ${phone} (${country})`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Demande de retrait envoyée. Traitement sous 24h max.' });
      setAmount('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Retrait</h1>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm">
        <p className="text-gray-500 text-sm font-medium mb-1">Solde disponible</p>
        <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(user?.balance || 0)}</h2>
        <div className="mt-4 inline-block bg-amber-50 text-amber-600 text-xs font-medium px-3 py-1 rounded-full border border-amber-100">
          Frais de retrait : 20%
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-3 rounded-xl text-sm text-center ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Montant à retirer (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="Min: 1000"
            required
            min="1000"
          />
          {amount && Number(amount) >= 1000 && (
            <p className="text-xs text-emerald-600 ml-1 mt-1">
              Vous recevrez : {formatCurrency(Number(amount) * 0.8)}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Pays</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value="Benin">Bénin</option>
            <option value="Togo">Togo</option>
            <option value="Cote d'Ivoire">Côte d'Ivoire</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Numéro de réception</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="Numéro Mobile Money"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Mot de passe de connexion</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl mt-6 transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Traitement...' : 'Demander le retrait'}
        </button>
      </form>
    </div>
  );
}
