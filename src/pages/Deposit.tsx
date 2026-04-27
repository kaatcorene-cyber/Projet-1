import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const link = data.find(s => s.key === 'payment_link')?.value;
        if (link) setPaymentLink(link);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 5000) {
      setError('Le montant minimum de dépôt est de 5000 FCFA.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: `Depot en ligne - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        navigate('/history');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la création du dépôt.');
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recharger</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-1">
          <div className="px-3 py-2 border-b border-gray-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Numéro de téléphone payeur</label>
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant (FCFA)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
              placeholder="Min: 5 000"
              required
              min="5000"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {loading ? 'Création...' : 'Payer maintenant'}
        </button>
      </form>
    </div>
  );
}
