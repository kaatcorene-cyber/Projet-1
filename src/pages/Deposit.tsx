import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState<1 | 2>(1);

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
        reference: `MONEYFUSION - ${user.phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      const paymentRes = await fetch("https://pay.moneyfusion.net/api/v2/links/init-payment", {
          method: "POST",
          headers: {
             "Content-Type": "application/json"
          },
          body: JSON.stringify({
             id: "6a07c1723e8ed1397e29e0da",
             montant: amount.toString(),
             name: "Parfait loua",
             phone: user.phone.replace(/\D/g, ''),
             customerEmail: "parfaitloua@gmail.com",
             countryCode: "+225"
          })
      });
      const paymentData = await paymentRes.json();
      
      if (paymentData.statut && paymentData.url) {
          const urlParts = paymentData.url.split('/');
          urlParts[urlParts.length - 1] = encodeURIComponent("Adela Mining");
          window.location.href = urlParts.join('/');
      } else {
          throw new Error(paymentData.message || "Erreur lors de la génération du lien de paiement");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recharger</h1>
      </header>

      {step === 2 ? (
         <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100 mt-4 animate-in fade-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <CheckCircle2 className="w-10 h-10 text-green-500" />
           </div>
           
           <h2 className="text-2xl font-black text-gray-900 mb-2">Redirection en cours</h2>
           <p className="text-gray-500 mb-6 font-medium">Veuillez patienter pendant que nous vous redirigeons vers la page de paiement sécurisée pour un montant de <span className="text-gray-900 font-black">{formatCurrency(Number(amount))}</span>.</p>
           
           <div className="w-full h-px bg-gray-100 mb-6"></div>

           <button onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-gray-200">
             Voir l'historique
             <ArrowRight className="w-5 h-5" />
           </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
               <Wallet className="w-6 h-6 text-purple-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Solde Actuel</p>
               <p className="text-xl font-black text-gray-900">{formatCurrency(user?.balance || 0)}</p>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Info className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-6 bg-gray-50/50">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Montant (FCFA)</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-purple-600 placeholder-purple-200 outline-none"
                  placeholder="5000"
                  required
                  min="5000"
                />
                <span className="text-gray-400 font-bold ml-2 text-xl">XOF</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Redirection...' : 'Confirmer le dépôt'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium">Vous serez redirigé vers une page de paiement sécurisée.</p>
        </form>
      )}
    </div>
  );
}
