import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Info, 
  Wallet, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';

const SUGGESTED_AMOUNTS = [
  3000,
  10000,
  25000,
  50000,
  75000,
  200000
];

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('3000');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  const handleSelectAmount = (val: number) => {
    setAmount(val.toString());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 3000) {
      setError('Le montant minimum de financement est de 3 000 FCFA.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Record pending transaction in Supabase
      try {
        await supabase.from('transactions').insert([{
          user_id: user.id,
          type: 'deposit',
          amount: numAmount,
          reference: `MoneyFusion - ${user.phone || 'Web'}`,
          status: 'pending'
        }]);
      } catch (txErr) {
        console.warn('Could not record pending transaction:', txErr);
      }

      setRedirecting(true);

      // 2. Prepare user info to auto-fill background fields
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client Cargill';
      const userPhone = user.phone || '0700000000';
      const cleanPhone = userPhone.startsWith('+') ? userPhone : `+225${userPhone.replace(/\s+/g, '')}`;
      const userEmail = `${cleanPhone.replace(/[^0-9]/g, '')}@cargill-ci.com`;

      const payload = {
        montant: numAmount,
        name: fullName,
        phone: cleanPhone,
        customerEmail: userEmail,
        countryCode: '+225'
      };

      // 3. Call server proxy for MoneyFusion init
      let redirectUrl = 'https://my.moneyfusion.net/6a7da1aa655b3c8aa7379d96';

      try {
        const res = await fetch('/api/moneyfusion/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            redirectUrl = data.url;
          }
        } else {
          // Direct fallback if proxy is down
          const directRes = await fetch('https://pay.moneyfusion.net/api/v2/links/init-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: '6a7da1aa655b3c8aa7379d96',
              ...payload
            })
          });
          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData && directData.url) {
              redirectUrl = directData.url;
            }
          }
        }
      } catch (callErr) {
        console.warn('Error calling init payment, using fallback URL:', callErr);
      }

      // 4. Redirect immediately to the payment page
      window.location.href = redirectUrl;

    } catch (err: any) {
      console.error('Erreur financement:', err);
      // Even on error, redirect to MoneyFusion payment link so the user is never blocked
      window.location.href = 'https://my.moneyfusion.net/6a7da1aa655b3c8aa7379d96';
    } finally {
      // Keep loader running while browser completes navigation
      setTimeout(() => {
        setLoading(false);
        setRedirecting(false);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-5 pt-8 pb-28 font-sans relative overflow-x-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-xs cursor-pointer active:scale-95"
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Financement</h1>
            <p className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider">Recharge Sécurisée</p>
          </div>
        </div>
        <AppLogo imgClassName="h-7 w-auto object-contain max-h-9" />
      </header>

      <div className="relative z-10 max-w-lg mx-auto space-y-4">
        
        {/* Solde Actuel */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-black/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Solde Actuel Disponible</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(user?.balance || 0)}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-500/20 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de Rechargement */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white rounded-3xl border border-black/5 shadow-xs p-5 space-y-4">
            
            {/* Propositions de montant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Propositions de montant
                </label>
                <span className="text-[11px] text-gray-400 font-medium">Sélection rapide</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {SUGGESTED_AMOUNTS.map((val) => {
                  const isSelected = amount === val.toString();
                  // Vrai montant affiché (3 000 F, 10 000 F, 25 000 F, etc.) sans "k"
                  const displayAmount = `${val.toLocaleString('fr-FR')} F`;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectAmount(val)}
                      className={`py-3 px-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-black/5 active:scale-95'
                      }`}
                    >
                      {displayAmount}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Saisie personnalisée du montant */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Montant du financement (FCFA)
              </label>
              
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-gray-50 border border-black/10 rounded-2xl px-4 py-3.5 text-2xl font-black text-emerald-700 placeholder-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="3000"
                  required
                  min="3000"
                  step="100"
                />
                <span className="absolute right-4 text-xs font-black text-gray-400 uppercase tracking-wider pointer-events-none">
                  FCFA
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-1">
                <span>Montant minimum : <strong>3 000 FCFA</strong></span>
              </div>
            </div>

          </div>

          {/* Bouton de validation */}
          <button
            type="submit"
            disabled={loading || redirecting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading || redirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirection sécurisée vers le paiement...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Valider le financement</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400 font-medium pt-1">
            Transaction cryptée et protégée par la passerelle agréée MoneyFusion
          </p>

        </form>

      </div>
    </div>
  );
}
