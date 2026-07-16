import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 1100) {
      setError('Le montant minimum de dépôt est de 1100 FCFA.');
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
        reference: `InvestAfrik - ${user.phone}`,
        status: 'pending'
      }]);
      if (txError) throw txError;
      
      const rawBaseUrl = config?.payment_link || 'https://my.moneyfusion.net/6a4cad8644eafb83a0614894';
      
      // Extraction de l'ID de boutique (24 caractères hexadécimaux)
      const shopIdMatch = rawBaseUrl.match(/([a-f0-9]{24})/i);
      const shopId = shopIdMatch ? shopIdMatch[1] : '6a4cad8644eafb83a0614894';

      // Nom: InvestAfrik (prénom) + user.first_name (qui stocke le pseudo)
      const fullName = `InvestAfrik ${user.first_name || 'User'}`;
      const email = 'investafrikpayement@gmail.com';
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
        throw new Error(initData.message || "Erreur avec la réponse de Fusion Money.");
      }

      let finalUrl = initData.url;
      // Remplacer le nom de la boutique par "InvestAfrik Pay"
      if (finalUrl) {
        finalUrl = finalUrl.replace(/Parfait(\s|%20)Shop/ig, 'InvestAfrik%20Pay');
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
    <div className="min-h-screen bg-slate-50 p-5 pt-12 pb-24 font-sans text-slate-900 max-w-lg mx-auto">
      
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Ajouter des fonds</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Recharger</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        {/* Balance Card */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-br from-blue-700 to-cyan-600 rounded-[32px] p-6 shadow-xl shadow-blue-600/20 border border-blue-600/30 relative overflow-hidden text-white"
        >
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
           
           <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Actuel</p>
                <p className="text-3xl font-black">{formatCurrency(user?.balance || 0)}</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner">
               <Wallet className="w-6 h-6 text-white" />
             </div>
           </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-medium flex items-start gap-3 shadow-sm"
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Montant à recharger</label>
             <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-blue-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-slate-900 placeholder-slate-300 outline-none"
                  placeholder="0"
                  required
                  min="1100"
                  max="500000"
                />
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
             {[1100, 5000, 15000, 40000, 90000, 200000].map((preset) => (
               <button
                 key={preset}
                 type="button"
                 onClick={() => setAmount(preset.toString())}
                 className={`flex-1 min-w-[30%] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 border ${
                   amount === preset.toString()
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
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
              className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? 'Redirection...' : 'Confirmer le dépôt'}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Paiement 100% Sécurisé</span>
          </div>
        </div>
      </form>
    </div>
  );
}
