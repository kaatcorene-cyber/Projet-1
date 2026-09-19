import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
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

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);
  
  // Saved withdrawal info
  const [savedMethod, setSavedMethod] = useState<string | null>(null);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [savedFullName, setSavedFullName] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadSavedAccount = async () => {
      setCheckingAccount(true);
      try {
        // 1. Check in local storage keys
        const keyNew = `translogis_withdraw_info_${user.id}`;
        const keyOld = `withdrawal_account_${user.id}`;
        
        const cachedNew = localStorage.getItem(keyNew);
        if (cachedNew) {
          try {
            const parsed = JSON.parse(cachedNew);
            if (parsed.method && parsed.phone && parsed.fullName) {
              setSavedMethod(parsed.method);
              setSavedPhone(parsed.phone);
              setSavedFullName(parsed.fullName);
              setIsConfigured(true);
              setCheckingAccount(false);
              return;
            }
          } catch (e) {}
        }

        const cachedOld = localStorage.getItem(keyOld);
        if (cachedOld) {
          try {
            const parsed = JSON.parse(cachedOld);
            if (parsed.method && parsed.phone) {
              setSavedMethod(parsed.method);
              setSavedPhone(parsed.phone);
              setSavedFullName(parsed.recipientName || `${user.first_name || ''} ${user.last_name || ''}`.trim());
              setIsConfigured(true);
              setCheckingAccount(false);
              return;
            }
          } catch (e) {}
        }

        // 2. Check user record address column (stored JSON)
        const userAddress = (user as any).address;
        if (userAddress) {
          try {
            const parsed = JSON.parse(userAddress);
            if (parsed.method && parsed.phone) {
              setSavedMethod(parsed.method);
              setSavedPhone(parsed.phone);
              setSavedFullName(parsed.fullName || `${user.first_name || ''} ${user.last_name || ''}`.trim());
              setIsConfigured(true);
              localStorage.setItem(keyNew, JSON.stringify(parsed));
              setCheckingAccount(false);
              return;
            }
          } catch (e) {}
        }

        // 3. Fallback: Check past withdrawal transactions
        const { data: pastWithdrawals } = await supabase
          .from('transactions')
          .select('reference')
          .eq('user_id', user.id)
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false })
          .limit(1);

        if (pastWithdrawals && pastWithdrawals.length > 0 && pastWithdrawals[0].reference) {
          const ref = pastWithdrawals[0].reference;
          const match = ref.match(/^(Wave|Moov Money|Orange Money|MTN Mobile Money|MTN MoMo)\s*-\s*([^\s(]+)(?:\s*\(([^)]+)\))?/i);
          if (match) {
            const m = match[1] || 'Wave';
            const p = match[2] || '';
            const n = match[3] || `${user.first_name || ''} ${user.last_name || ''}`.trim();
            setSavedMethod(m);
            setSavedPhone(p);
            setSavedFullName(n);
            setIsConfigured(true);
            localStorage.setItem(keyNew, JSON.stringify({ method: m, phone: p, fullName: n }));
            setCheckingAccount(false);
            return;
          }
        }

        setIsConfigured(false);
      } catch (err) {
        console.error('Error loading withdrawal details:', err);
      } finally {
        setCheckingAccount(false);
      }
    };

    loadSavedAccount();
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

    const nowLocal = new Date();
    const gmtDay = nowLocal.getUTCDay();
    const gmtHour = nowLocal.getUTCHours();
    
    if (gmtDay === 0) {
      return setMessage({ type: 'error', text: 'Opérations de retrait suspendues le dimanche.' });
    }
    if (gmtHour < 9 || gmtHour >= 17) {
      return setMessage({ type: 'error', text: 'Horaires d’ouverture des retraits : 09:00 - 17:00 GMT.' });
    }
    
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1000) {
      return setMessage({ type: 'error', text: 'Le montant minimum de retrait est de 1 000 FCFA.' });
    }

    if (!password) {
      return setMessage({ type: 'error', text: 'Veuillez saisir votre mot de passe pour valider le retrait.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      // Verify password
      const { data: verifiedUser, error: authError } = await supabase
        .from('users')
        .select('id, balance, password_hash')
        .eq('id', user.id)
        .single();

      if (authError || !verifiedUser) {
        throw new Error('Erreur de vérification de session.');
      }

      if (verifiedUser.password_hash && verifiedUser.password_hash !== password) {
        throw new Error('Mot de passe incorrect. Veuillez réessayer.');
      }

      const currentBalance = Number(verifiedUser.balance || 0);
      if (currentBalance < numAmount) {
        throw new Error(`Solde insuffisant. Votre solde actuel est de ${formatCurrency(currentBalance)}.`);
      }

      // Deduct balance
      const newBalance = currentBalance - numAmount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Fee calculation: 10%
      const fee = Math.round(numAmount * 0.10);
      const netAmount = numAmount - fee;
      const referenceText = `${savedMethod} - ${savedPhone} (${savedFullName || 'Titulaire'}) | Net: ${netAmount} FCFA (Frais: ${fee} FCFA)`;

      // Create transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'withdrawal',
          amount: numAmount,
          status: 'pending',
          reference: referenceText,
          description: `Retrait vers ${savedMethod} ${savedPhone}`,
          created_at: new Date().toISOString()
        }]);

      if (txError) throw txError;

      await refreshUser();

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
            <p className="text-emerald-700 text-[10px] uppercase font-black tracking-wider">Paiement Mobile Money</p>
          </div>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-lg mx-auto space-y-4 px-3 sm:px-0">
        
        {/* Balance Direct Band */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-2 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Retirable</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{formatCurrency(user?.balance || 0)}</h2>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 border border-slate-200">
            Frais de réseau : 10% • Heures : 09h00 - 17h00 GMT
          </div>
        </div>

        {checkingAccount ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
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
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
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
                message.type === 'success' ? 'bg-emerald-100 border border-emerald-300 text-emerald-950' : 'bg-red-50 border border-red-300 text-red-900'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Encadré Récapitulatif Coordonnées de Réception */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Destination du virement
                </span>
                <Link
                  to="/withdraw-info"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modifier</span>
                </Link>
              </div>

              <div className="bg-white rounded-xl p-3 border border-emerald-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Moyen :</span>
                  <span className="font-black text-slate-900">{savedMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Numéro :</span>
                  <span className="font-mono font-black text-emerald-800">{savedPhone}</span>
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
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
                    placeholder="Ex: 5000"
                    required
                    min="1000"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-500 uppercase tracking-wider pointer-events-none">
                    FCFA
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Minimum de retrait : 1 000 FCFA</p>
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
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
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
                className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
