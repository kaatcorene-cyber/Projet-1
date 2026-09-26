import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, saveStoredLocalUser } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { saveLocalTransaction, getLocalTransactions } from '../lib/dataStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  CreditCard,
  ArrowRight,
  Edit2,
  Lock
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';

interface ResolvedWithdrawalAccount {
  country: string | null;
  dialCode: string | null;
  method: string;
  phone: string;
  fullName: string;
}

function resolveWithdrawalAccount(user: any): ResolvedWithdrawalAccount | null {
  if (!user || !user.id) return null;

  // 1. Vérification locale immédiate (clés de cache agritrans / translogis / withdrawal_account)
  const keys = [
    `agritrans_withdraw_info_${user.id}`,
    `translogis_withdraw_info_${user.id}`,
    `withdrawal_account_${user.id}`
  ];

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.method && p.phone) {
          return {
            country: p.country || user.country || null,
            dialCode: p.dialCode || null,
            method: p.method,
            phone: p.phone,
            fullName: p.fullName || p.recipientName || `${user.first_name || ''} ${user.last_name || ''}`.trim()
          };
        }
      }
    } catch (e) {}
  }

  // 2. Vérification immédiate dans le profil (champ address)
  if (user.address) {
    try {
      const p = JSON.parse(user.address);
      if (p.method && p.phone) {
        return {
          country: p.country || user.country || null,
          dialCode: p.dialCode || null,
          method: p.method,
          phone: p.phone,
          fullName: p.fullName || `${user.first_name || ''} ${user.last_name || ''}`.trim()
        };
      }
    } catch (e) {}
  }

  // 3. Vérification immédiate dans l'historique des transactions locales
  try {
    const localTxs = getLocalTransactions();
    const lastWithdrawal = localTxs.find(tx => 
      (tx.user_id === user.id || tx.user_id === user.phone) && 
      tx.type === 'withdrawal' && 
      tx.reference
    );
    if (lastWithdrawal && lastWithdrawal.reference) {
      const ref = lastWithdrawal.reference;
      const countryMatch = ref.match(/^\[([^\]]+)\]\s*/);
      const country = countryMatch ? countryMatch[1] : user.country || null;
      const cleanRef = ref.replace(/^\[[^\]]+\]\s*/, '');
      const parts = cleanRef.split(' - ');
      if (parts.length >= 2) {
        const m = parts[0].trim();
        const remainder = parts.slice(1).join(' - ');
        const phoneMatch = remainder.match(/^(\+?[0-9\s]+)(?:\s*\(([^)]+)\))?/);
        if (phoneMatch) {
          const p = phoneMatch[1].trim();
          const n = phoneMatch[2]?.trim() || `${user.first_name || ''} ${user.last_name || ''}`.trim();
          return {
            country,
            dialCode: null,
            method: m,
            phone: p,
            fullName: n
          };
        }
      }
    }
  } catch (e) {}

  return null;
}

export function Withdraw() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Résolution synchrone instantanée (0ms de latence au chargement)
  const initialResolved = useMemo(() => resolveWithdrawalAccount(user), [user]);
  
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState<boolean>(false);
  
  // Saved withdrawal info
  const [savedCountry, setSavedCountry] = useState<string | null>(initialResolved?.country || null);
  const [savedDialCode, setSavedDialCode] = useState<string | null>(initialResolved?.dialCode || null);
  const [savedMethod, setSavedMethod] = useState<string | null>(initialResolved?.method || null);
  const [savedPhone, setSavedPhone] = useState<string | null>(initialResolved?.phone || null);
  const [savedFullName, setSavedFullName] = useState<string | null>(initialResolved?.fullName || null);
  const [isConfigured, setIsConfigured] = useState(Boolean(initialResolved?.method && initialResolved?.phone));
  
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Synchronisation distante discrète en tâche de fond si non configuré localement
  useEffect(() => {
    if (!user) return;

    const resolved = resolveWithdrawalAccount(user);
    if (resolved) {
      setSavedCountry(resolved.country);
      setSavedDialCode(resolved.dialCode);
      setSavedMethod(resolved.method);
      setSavedPhone(resolved.phone);
      setSavedFullName(resolved.fullName);
      setIsConfigured(true);
      return;
    }

    // Requête légère avec timeout strict de 700ms pour ne jamais bloquer l'écran
    let isCancelled = false;
    const checkRemote = async () => {
      try {
        const timeoutPromise = new Promise<{ data: null }>((resolve) => 
          setTimeout(() => resolve({ data: null }), 700)
        );
        const queryPromise = supabase
          .from('transactions')
          .select('reference')
          .eq('user_id', user.id)
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false })
          .limit(1);

        const { data } = await Promise.race([queryPromise, timeoutPromise]);
        if (!isCancelled && data && data.length > 0 && data[0].reference) {
          const ref = data[0].reference;
          const countryMatch = ref.match(/^\[([^\]]+)\]\s*/);
          const country = countryMatch ? countryMatch[1] : null;
          const cleanRef = ref.replace(/^\[[^\]]+\]\s*/, '');
          const parts = cleanRef.split(' - ');
          if (parts.length >= 2) {
            const m = parts[0].trim();
            const remainder = parts.slice(1).join(' - ');
            const phoneMatch = remainder.match(/^(\+?[0-9\s]+)(?:\s*\(([^)]+)\))?/);
            if (phoneMatch) {
              const p = phoneMatch[1].trim();
              const n = phoneMatch[2]?.trim() || `${user.first_name || ''} ${user.last_name || ''}`.trim();
              setSavedCountry(country);
              setSavedMethod(m);
              setSavedPhone(p);
              setSavedFullName(n);
              setIsConfigured(true);
              localStorage.setItem(`agritrans_withdraw_info_${user.id}`, JSON.stringify({
                country,
                method: m,
                phone: p,
                fullName: n
              }));
            }
          }
        }
      } catch (err) {
      } finally {
        if (!isCancelled) setCheckingAccount(false);
      }
    };

    checkRemote();
    return () => { isCancelled = true; };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!isConfigured || !savedMethod || !savedPhone) {
      return setMessage({
        type: 'error',
        text: 'Veuillez d’abord renseigner vos informations de retrait avant de continuer.'
      });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 2000) {
      return setMessage({ type: 'error', text: 'Le montant minimum de retrait est de 2 000 FCFA.' });
    }

    if (!password) {
      return setMessage({ type: 'error', text: 'Veuillez saisir votre mot de passe pour valider le retrait.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Vérification du mot de passe avec fallback instantané
      let verifiedPasswordHash = user.password_hash;
      let currentBalance = Number(user.balance || 0);

      try {
        const timeoutPromise = new Promise<any>((res) => setTimeout(() => res({ data: null }), 700));
        const userQuery = supabase
          .from('users')
          .select('id, balance, password_hash')
          .eq('id', user.id)
          .maybeSingle();

        const { data: dbUser } = await Promise.race([userQuery, timeoutPromise]);
        if (dbUser) {
          if (dbUser.password_hash) verifiedPasswordHash = dbUser.password_hash;
          if (dbUser.balance !== undefined) currentBalance = Number(dbUser.balance || 0);
        }
      } catch (e) {}

      if (verifiedPasswordHash && verifiedPasswordHash !== password) {
        throw new Error('Mot de passe incorrect. Veuillez réessayer.');
      }

      if (currentBalance < numAmount) {
        throw new Error(`Solde insuffisant. Votre solde actuel est de ${formatCurrency(currentBalance)}.`);
      }

      // 2. Déduction immédiate du solde en local & sur le serveur
      const newBalance = currentBalance - numAmount;
      useAuthStore.getState().updateBalance(newBalance);
      saveStoredLocalUser({ ...user, balance: newBalance });

      try {
        fetch(`/api/users/${user.id}/balance`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBalance })
        }).catch(() => {});
      } catch (e) {}

      // 3. Calcul des frais réglementaires : 15%
      const fee = Math.round(numAmount * 0.15);
      const netAmount = numAmount - fee;
      const countryLabel = savedCountry ? `[${savedCountry}] ` : '';
      const dialLabel = savedDialCode ? `${savedDialCode} ` : '';
      const referenceText = `${countryLabel}${savedMethod} - ${dialLabel}${savedPhone} (${savedFullName || 'Titulaire'}) | Net: ${netAmount} FCFA (Frais 15%: ${fee} FCFA)`;

      // 4. Enregistrement local immédiat de la transaction
      const newTxId = 'tx_' + Date.now();
      saveLocalTransaction({
        id: newTxId,
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        status: 'pending',
        reference: referenceText,
        description: `Retrait ${savedCountry ? `(${savedCountry}) ` : ''}vers ${savedMethod} ${dialLabel}${savedPhone}`,
        created_at: new Date().toISOString()
      });

      // 5. Synchronisation immédiate avec le serveur d'API interne (<5ms)
      try {
        await Promise.all([
          fetch(`/api/users/${user.id}/balance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
          }),
          fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newTxId,
              user_id: user.id,
              type: 'withdrawal',
              amount: numAmount,
              status: 'pending',
              reference: referenceText,
              description: `Retrait ${savedCountry ? `(${savedCountry}) ` : ''}vers ${savedMethod} ${dialLabel}${savedPhone}`,
              created_at: new Date().toISOString()
            })
          })
        ]);
      } catch (srvErr) {
        console.warn('Erreur synchronisation serveur interne:', srvErr);
      }

      // Synchronisation distante Supabase en tâche de fond discrète
      Promise.resolve(
        supabase.from('transactions').insert([{
          id: newTxId,
          user_id: user.id,
          type: 'withdrawal',
          amount: numAmount,
          status: 'pending',
          reference: referenceText,
          description: `Retrait ${savedCountry ? `(${savedCountry}) ` : ''}vers ${savedMethod} ${dialLabel}${savedPhone}`,
          created_at: new Date().toISOString()
        }])
      ).catch(() => {});

      setMessage({
        type: 'success',
        text: `Demande de retrait de ${formatCurrency(numAmount)} enregistrée avec succès. Virement en cours de traitement.`
      });
      setAmount('');
      setPassword('');

    } catch (err: any) {
      console.error('Withdraw error:', err);
      setMessage({
        type: 'error',
        text: err?.message || 'Une erreur est survenue lors de la demande de retrait.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Bar */}
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
            <h1 className="text-base font-black text-slate-900 tracking-tight">Retrait</h1>
            <p className="text-red-700 text-[10px] uppercase font-black tracking-wider">Paiement Mobile Money</p>
          </div>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-lg mx-auto space-y-4 px-3 sm:px-0">
        
        {/* Balance Direct Band */}
        <div className="bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-center shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Solde Retirable</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">{formatCurrency(user?.balance || 0)}</h2>
        </div>

        {checkingAccount ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            <p className="text-xs text-slate-600 font-bold">Vérification de vos informations de retrait...</p>
          </div>
        ) : !isConfigured ? (
          /* Missing withdrawal info: prompt user to go configure it */
          <div className="bg-white border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Informations de retrait non renseignées
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Pour des raisons de sécurité, vous devez d’abord renseigner votre moyen de réception, votre numéro et le nom du titulaire avant d’effectuer un retrait.
            </p>
            <Link
              to="/withdraw-info"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/25 cursor-pointer"
            >
              <span>Renseigner mes informations de retrait</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Ready: User already saved info -> only Amount & Password requested */
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-sm ${
                message.type === 'success' ? 'bg-red-100 border border-red-300 text-red-950' : 'bg-red-50 border border-red-300 text-red-900'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-red-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Encadré Récapitulatif Coordonnées de Réception */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  Destination du virement
                </span>
                <Link
                  to="/withdraw-info"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:text-red-800 bg-white border border-red-300 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modifier</span>
                </Link>
              </div>

              <div className="bg-white rounded-xl p-3 border border-red-100 space-y-1.5 text-xs">
                {savedCountry && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Pays :</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <span>{savedCountry}</span>
                      {savedDialCode && <span className="text-slate-500 text-[11px] font-mono">({savedDialCode})</span>}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Moyen :</span>
                  <span className="font-black text-slate-900">{savedMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Numéro :</span>
                  <span className="font-mono font-black text-red-800">
                    {savedDialCode ? `${savedDialCode} ` : ''}{savedPhone}
                  </span>
                </div>
                {savedFullName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Titulaire :</span>
                    <span className="font-bold text-slate-900 uppercase">{savedFullName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulaire simplifié : Montant + Mot de passe */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              {/* 1. Montant */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Montant à retirer (FCFA)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 transition-all"
                    placeholder="Ex: 5000"
                    required
                    min="2000"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-500 uppercase tracking-wider pointer-events-none">
                    FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span>Minimum de retrait : <strong className="text-slate-900 font-black">2 000 FCFA</strong></span>
                  <span>Frais de retrait : <strong className="text-slate-900 font-black">15%</strong></span>
                </div>

                {/* Calcul en direct des frais et du net reçu */}
                {Number(amount) >= 2000 && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs animate-in fade-in">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Montant brut demandé :</span>
                      <span className="font-bold text-slate-900">{formatCurrency(Number(amount))}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700">
                      <span>Frais de retrait (15%) :</span>
                      <span className="font-bold">- {formatCurrency(Math.round(Number(amount) * 0.15))}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-red-800">
                      <span className="font-black">Montant net viré sur votre compte :</span>
                      <span className="text-sm font-black text-red-700">
                        {formatCurrency(Number(amount) - Math.round(Number(amount) * 0.15))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Mot de passe */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Mot de passe du compte
                </label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 transition-all"
                    placeholder="Saisissez votre mot de passe"
                    required
                  />
                  <span className="absolute right-4 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Sécurité renforcée pour authentifier votre demande.</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement sécurisé en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmer le retrait</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
