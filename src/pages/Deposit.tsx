import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Wallet, Zap, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function Deposit() {
  const { user } = useAuthStore();
  const { config } = useAppStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!user) return;
    
    if (Number(amount) < 2000) {
      setError('Le montant minimum de dépôt est de 2000 FCFA.');
      return;
    }

    if (Number(amount) > 500000) {
      setError('Le montant maximum de dépôt est de 500 000 FCFA.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: `FUSION - ${user.phone}`,
        status: 'pending' // En attente de paiement
      }]);
      if (txError) throw txError;
      
      const rawBaseUrl = config?.payment_link || 'https://my.moneyfusion.net/6a7da1aa655b3c8aa7379d96';
      
      const shopIdMatch = rawBaseUrl.match(/([a-f0-9]{24})/i);
      const shopId = shopIdMatch ? shopIdMatch[1] : '6a7da1aa655b3c8aa7379d96';
      const fullName = `ElevFinAi ${user.first_name || 'User'}`;
      const email = 'elevfinaipayement@gmail.com';
      const phone = user.phone || '00000000';
      const formattedPhone = phone.startsWith('+') ? phone : `+225${phone.replace(/^0+/, '')}`;
      
      const initResponse = await fetch('https://pay.moneyfusion.net/api/v2/links/init-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: shopId,
          montant: amount,
          name: fullName,
          phone: formattedPhone,
          customerEmail: email,
          countryCode: "+225"
        })
      });
      if (!initResponse.ok) {
        throw new Error("Erreur réseau lors de l'initialisation du paiement.");
      }
      const initData = await initResponse.json();
      
      if (!initData.statut || !initData.url) {
        throw new Error("Erreur avec la réponse de Fusion Money.");
      }
      let finalUrl = initData.url;
      if (finalUrl) {
        finalUrl = finalUrl.replace(/assande(\s|%20)tanoa(\s|%20)grace(\s|%20)Deborat/ig, 'ElevFinAi%20Pay');
      }
      
      window.location.href = finalUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-10 pb-32 font-sans text-slate-900 relative">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Recharger</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Ajouter des fonds</p>
        </div>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Balance Card */}
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
           
           <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Actuel</p>
                <p className="text-3xl font-black">{formatCurrency(user?.balance || 0)}</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
               <Wallet className="w-6 h-6 text-white" />
             </div>
           </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3 shadow-sm"
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Montant à recharger</label>
             <div className="bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-slate-900 placeholder-slate-300 outline-none"
                  placeholder="0"
                  required
                  min="2000"
                  max="500000"
                />
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
             {[3000, 7000, 15000, 31000, 63000, 249000].map((preset) => (
               <button
                 key={preset}
                 type="button"
                 onClick={() => setAmount(preset.toString())}
                 className={`py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 border ${
                   amount === preset.toString()
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                 }`}
               >
                 {preset >= 100000 ? <Zap className="w-3.5 h-3.5" /> : null}
                 {preset >= 1000 ? `${preset / 1000}k` : preset}
               </button>
             ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? 'Redirection...' : 'Confirmer le dépôt'}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Paiement 100% Sécurisé</span>
          </div>
        </form>
      </div>
    </div>
  );
}
