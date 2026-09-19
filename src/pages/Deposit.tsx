import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, ArrowRight, ShieldCheck, Zap, Info, Loader2, Sparkles, CheckCircle2, Phone, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';

const SUGGESTED_AMOUNTS = [5000, 15000, 25000, 40000, 90000, 120000, 200000, 300000, 450000];

export function Deposit() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('5000');
  const [phone, setPhone] = useState<string>(() => {
    if (!user?.phone) return '';
    const p = user.phone.replace(/^\+225/, '').trim();
    return p;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [automationStep, setAutomationStep] = useState<string>('');
  const checkIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone.replace(/^\+225/, '').trim());
    }
  }, [user?.phone]);

  // Check and verify pending deposit on mount and poll if recent
  useEffect(() => {
    async function checkPending() {
      const saved = localStorage.getItem('agritrans_pending_deposit');
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        if (!data || !data.token) return;

        const res = await fetch(`/api/moneyfusion/verify?token=${data.token}&txId=${data.txId || ''}&userId=${user?.id || ''}`);
        if (res.ok) {
          const result = await res.json();
          if (result.credited || result.status === 'already_completed') {
            await refreshUser();
            setSuccessMessage(`Dépôt de ${formatCurrency(data.amount || 0)} validé automatiquement avec succès !`);
            localStorage.removeItem('agritrans_pending_deposit');
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          }
        }
      } catch (e) {
        console.warn('Auto check error:', e);
      }
    }

    checkPending();

    // Check periodically for 45s after landing back
    checkIntervalRef.current = setInterval(checkPending, 5000);
    const timeout = setTimeout(() => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    }, 45000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      clearTimeout(timeout);
    };
  }, [user?.id, refreshUser]);

  const handleSelectAmount = (val: number) => {
    setAmount(val.toString());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 5000) {
      setError('Le montant minimum de financement est de 5 000 FCFA');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const cleanInput = phone.trim().replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const nationalNumber = cleanInput.startsWith('225') ? cleanInput.slice(3) : cleanInput;
    if (!nationalNumber || nationalNumber.length < 8) {
      setError('Veuillez renseigner un numéro de téléphone valide (ex: 0704752133)');
      return;
    }

    const fullPhone = `+225${nationalNumber}`;
    const userEmail = `${nationalNumber}@agritrans-ci.com`;

    setLoading(true);
    setRedirecting(true);
    setAutomationStep('1/3 Enregistrement de la transaction...');

    try {
      let createdTxId = '';
      try {
        const { data: newTx } = await supabase.from('transactions').insert([{
          user_id: user.id,
          type: 'deposit',
          amount: numAmount,
          reference: `MoneyFusion - En attente`,
          status: 'pending'
        }]).select().single();
        if (newTx?.id) {
          createdTxId = newTx.id;
        }
      } catch (txErr) {
        console.warn('Could not record pending transaction:', txErr);
      }

      setAutomationStep('2/3 Remplissage automatique de la première page MoneyFusion...');

      const payload = {
        montant: numAmount,
        name: 'Dépôt de',
        phone: fullPhone,
        customerEmail: userEmail,
        countryCode: '+225',
        userId: user.id,
        txId: createdTxId
      };

      let directPaymentUrl = '';
      let directToken = '';

      // Perform background pre-fill call
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch('/api/moneyfusion/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.url && !resData.url.includes('my.moneyfusion.net')) {
              directPaymentUrl = resData.url;
              directToken = resData.token;
              break;
            }
          }
        } catch (fetchErr) {
          console.warn(`Tentative ${attempt} échec:`, fetchErr);
        }
      }

      if (!directPaymentUrl) {
        throw new Error("Impossible d'initialiser automatiquement la session de paiement direct. Veuillez vérifier votre connexion et réessayer.");
      }

      if (directToken) {
        localStorage.setItem('agritrans_pending_deposit', JSON.stringify({
          token: directToken,
          txId: createdTxId,
          amount: numAmount,
          time: Date.now()
        }));
      }

      setAutomationStep('3/3 Accès direct à la sélection Mobile Money (Wave, Orange, MTN, Moov)...');

      // Direct redirection to the payment selection page, bypassing the 1st page entirely
      window.location.href = directPaymentUrl;

    } catch (err: any) {
      console.error('Erreur lors de l’automatisation du paiement:', err);
      setError(err.message || 'Une erreur est survenue lors de l’automatisation en arrière-plan.');
      setLoading(false);
      setRedirecting(false);
      setAutomationStep('');
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer"
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Financement</h1>
            <p className="text-emerald-700 text-[10px] uppercase font-black tracking-wider">Rechargement Mobile Money</p>
          </div>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-lg mx-auto space-y-4 px-3 sm:px-0">
        
        {/* Solde Actuel Direct Band */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-900 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Disponible Actuel</p>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{formatCurrency(user?.balance || 0)}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0 text-emerald-700">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <Info className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de Rechargement */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            
            {/* Propositions de montant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Sélection rapide de montant
                </label>
                <span className="text-xs text-slate-500 font-bold">FCFA</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {SUGGESTED_AMOUNTS.map((val) => {
                  const isSelected = amount === val.toString();
                  const displayAmount = `${val.toLocaleString('fr-FR')} F`;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectAmount(val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 active:scale-95'
                      }`}
                    >
                      {displayAmount}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Saisie personnalisée du montant */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Montant personnalisé (FCFA)
              </label>
              
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
                  placeholder="5000"
                  required
                  min="5000"
                  step="100"
                />
                <span className="absolute right-4 text-xs font-black text-slate-500 uppercase tracking-wider pointer-events-none">
                  FCFA
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-medium">
                <span>Montant minimum requis : <strong className="text-slate-900 font-black">5 000 FCFA</strong></span>
              </div>
            </div>

            {/* Numéro Mobile Money pour le rechargement */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Numéro Mobile Money (Wave / Orange / MTN / Moov)
                </label>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Rempli auto
                </span>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-black text-slate-500 select-none">
                  +225
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl pl-16 pr-4 py-3 text-base font-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
                  placeholder="0700000000"
                  required
                />
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-emerald-950 font-medium">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatisation totale :</strong> La 1ère page de MoneyFusion est remplie automatiquement en arrière-plan avec vos coordonnées pour vous diriger directement vers le paiement final.
                </span>
              </div>
            </div>

          </div>

          {/* État d'avancement de l'automatisation en arrière-plan */}
          {redirecting && automationStep && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">Automatisation MoneyFusion</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{automationStep}</p>
              </div>
            </div>
          )}

          {/* Bouton de validation */}
          <button
            type="submit"
            disabled={loading || redirecting}
            className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading || redirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Remplissage automatique en arrière-plan...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Confirmer et Recharger {Number(amount) > 0 ? formatCurrency(Number(amount)) : ''}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement crypté & garanti par la passerelle MoneyFusion</span>
          </div>

        </form>

      </div>
    </div>
  );
}
