import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('https://bkapay.com/merchant/20cf6268');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch payment link from settings
    supabase.from('settings').select('value').eq('key', 'payment_link').single().then(({ data }) => {
      if (data && data.value) setPaymentLink(data.value);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 2500) {
      setError('Le montant minimum de dépôt est de 2500 FCFA.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: `Depot - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      // Navigate to external payment link
      window.location.href = paymentLink;
    } catch (err) {
      setError('Une erreur est survenue lors de la création du dépôt.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Recharger le compte</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Montant à recharger (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            placeholder="Ex: 5000"
            required
            min="2500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Numéro de téléphone payeur</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            placeholder="Ex: 0123456789"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-all duration-300 disabled:opacity-50 shadow-md active:scale-95"
        >
          {loading ? 'Chargement...' : 'Recharger'}
        </button>
      </form>
    </div>
  );
}
