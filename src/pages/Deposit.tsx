import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
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
        reference: `Depot en ligne - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      setStep(2); // Go to instruction step
    } catch (err) {
      setError('Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
      navigate('/history');
    } else {
      setError("Le lien de paiement n'est pas configuré.");
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

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              placeholder="Votre numéro (ex: 0123456789)"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-all duration-300 disabled:opacity-50 shadow-md active:scale-95 cursor-pointer"
          >
            {loading ? 'Création...' : 'Valider'}
          </button>
        </form>
      ) : (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in flex flex-col">
          <header className="bg-emerald-500 p-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-md flex flex-col items-center justify-center relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-black text-2xl tracking-tighter text-white">PETROLIMEX pay</span>
            </div>
            <p className="text-emerald-100 text-sm font-medium">Paiement sécurisé</p>
          </header>

          <div className="flex-1 p-6 space-y-6 max-w-md mx-auto w-full -mt-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6 text-gray-900 relative z-10">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Demande enregistrée</h2>
                <p className="text-sm text-gray-500">
                  Votre demande de recharge de {formatCurrency(Number(amount))} a été enregistrée.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={proceedToPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md active:scale-95 cursor-pointer mb-2"
              >
                Procéder au paiement
              </button>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800 font-medium text-center">
                  ⚠️ Votre compte sera rechargé automatiquement après vérification de votre paiement en ligne.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
