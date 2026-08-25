import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Wallet, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        reference: `RECHARGE - ${user.phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'payment_link').single();
      const paymentLink = settingsData?.value || "https://my.moneyfusion.net/6a7da1aa655b3c8aa7379d96";

      
      let linkId = '';
      try {
        const urlObj = new URL(paymentLink);
        linkId = urlObj.pathname.split('/').pop() || '';
      } catch (e) {
        linkId = paymentLink.split('/').pop() || '';
      }

      if (!linkId) {
        throw new Error('ID de lien invalide');
      }

      const payload = {
        id: linkId,
        montant: amount,
        name: `FuelMax Payement ${user.phone || ''}`.trim(),
        merchantName: "FuelMax Payement",
        shopName: "FuelMax Payement",
        title: "FuelMax Payement",
        description: "Rechargement de compte FuelMax",
        customerEmail: "fuelmaxacte2@gmail.com",
        phone: user.phone || '',
        countryCode: "+225"
      };

      const res = await fetch('https://pay.moneyfusion.net/api/v2/links/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.statut && data.url) {
        let finalUrl = data.url;
        finalUrl = finalUrl.replace(/assande(?:%20|\s|\+)*tanoa(?:%20|\s|\+)*grace(?:%20|\s|\+)*deborat/ig, encodeURIComponent('FuelMax Payement'));
        window.location.href = finalUrl;
      } else {
        throw new Error("Erreur MoneyFusion: " + (data.message || JSON.stringify(data)));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Recharger</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Ajouter des fonds</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in relative z-10">
        
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 shadow-lg border border-red-500/30 relative overflow-hidden">
             {/* Glows */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -mr-8 -mt-8 pointer-events-none"></div>
             
             <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Solde Actuel</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(user?.balance || 0)}</p>
               </div>
               <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                 <Wallet className="w-6 h-6 text-red-100" />
               </div>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">Montant à recharger</label>
             <div className="bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl p-4 transition-all duration-300 flex flex-col">
                <div className="flex items-center">
                  <span className="text-zinc-500 font-bold text-2xl mr-3">FCFA</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-4xl font-black text-zinc-50 placeholder-zinc-700 outline-none"
                    placeholder="0"
                    required
                    min="5000"
                  />
                </div>
             </div>
          </div>

           <div className="flex flex-wrap gap-3">
             {[5000, 40000, 90000, 200000, 450000, 700000].map((preset) => (
               <button
                 key={preset}
                 type="button"
                 onClick={() => setAmount(preset.toString())}
                 className={`flex-1 min-w-[30%] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 border ${
                   amount === preset.toString() 
                     ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-sm' 
                     : 'bg-zinc-900/80 backdrop-blur-xl text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                 }`}
               >
                 {preset.toLocaleString('fr-FR')} F
               </button>
             ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !amount || Number(amount) < 5000}
              className="w-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] border border-red-500/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Redirection en cours...'
              ) : (
                <>
                  Payer {amount ? formatCurrency(Number(amount)) : ''}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
          
        <div className="flex items-center justify-center gap-2 text-zinc-500">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Paiement 100% sécurisé</p>
        </div>
      </form>
    </div>
  );
}

