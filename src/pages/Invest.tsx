import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, saveStoredLocalUser } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { saveLocalInvestment, saveLocalTransaction, getLocalInvestments, distributeInvestmentCommissions } from '../lib/dataStore';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Truck, 
  ArrowRight, 
  Wallet, 
  PlusCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { TransportPlan, DEFAULT_TRANSPORT_PLANS } from '../data/plans';

export type { TransportPlan };
export type CropPlan = TransportPlan;
export const TRANSPORT_PLANS = DEFAULT_TRANSPORT_PLANS;
export const CROP_PLANS = DEFAULT_TRANSPORT_PLANS;

export function Invest() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { setInvestmentsCache } = useAppStore();
  const [plans, setPlans] = useState<TransportPlan[]>(() => {
    try {
      const cached = localStorage.getItem('agritrans_investment_plans') || localStorage.getItem('translogis_investment_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_TRANSPORT_PLANS;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);

  useEffect(() => {
    refreshUser();

    if (user?.id) {
      const fetchActiveCount = async () => {
        try {
          const localInvs = getLocalInvestments(user.id);
          const activeLocal = localInvs.filter(i => i.status === 'active').length;
          setActiveCount(activeLocal);
        } catch (e) {}
      };
      fetchActiveCount();
    }

    async function fetchPlans() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings?.investment_plans) {
            const parsed = JSON.parse(settings.investment_plans);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const formatted = parsed.map((p: any, idx: number) => ({
                ...p,
                id: p.id || `plan_${p.amount || idx}_${idx}`,
                name: p.name || `Formule ${formatCurrency(p.amount)}`
              }));
              setPlans(formatted);
              localStorage.setItem('agritrans_investment_plans', JSON.stringify(formatted));
              return;
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    fetchPlans();

    const handlePlansUpdate = () => {
      try {
        const cached = localStorage.getItem('agritrans_investment_plans') || localStorage.getItem('translogis_investment_plans');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('agritrans_plans_updated', handlePlansUpdate);
    window.addEventListener('translogis_plans_updated', handlePlansUpdate);
    window.addEventListener('storage', handlePlansUpdate);

    return () => {
      window.removeEventListener('agritrans_plans_updated', handlePlansUpdate);
      window.removeEventListener('translogis_plans_updated', handlePlansUpdate);
      window.removeEventListener('storage', handlePlansUpdate);
    };
  }, [user?.id]);

  const handleInvest = async (plan: TransportPlan, key: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.locked) {
      setMessage({ type: 'error', text: 'Cette formule de transport est temporairement indisponible.' });
      return;
    }

    const currentBalance = Number(user.balance || 0);
    const requiredAmount = Number(plan.amount);

    if (currentBalance < requiredAmount) {
      setMessage({
        type: 'error',
        text: `Solde insuffisant (${formatCurrency(currentBalance)}). Il vous manque ${formatCurrency(requiredAmount - currentBalance)} pour activer ce véhicule.`
      });
      return;
    }

    try {
      setLoading(key);
      setMessage(null);

      const now = new Date();
      const endsAt = new Date(now.getTime() + (plan.duration || 60) * 24 * 60 * 60 * 1000);
      const newBalance = currentBalance - requiredAmount;
      const investId = 'inv_' + Date.now();
      const txId = 'tx_sub_' + Date.now();

      // 1. Déduction locale immédiate du solde
      useAuthStore.getState().updateBalance(newBalance);
      saveStoredLocalUser({ ...user, balance: newBalance });
      try {
        fetch(`/api/users/${user.id}/balance`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBalance })
        }).catch(() => {});
      } catch (e) {}

      // 2. Enregistrement local immédiat de l'investissement
      const localInv = {
        id: investId,
        user_id: user.id,
        plan_amount: requiredAmount,
        daily_yield: Number(plan.daily),
        start_date: now.toISOString(),
        end_date: endsAt.toISOString(),
        last_paid_at: now.toISOString(),
        status: 'active' as const
      };
      saveLocalInvestment(localInv);

      // 3. Enregistrement local immédiat de la transaction
      saveLocalTransaction({
        id: txId,
        user_id: user.id,
        type: 'investment',
        amount: requiredAmount,
        status: 'approved',
        reference: `Souscription - ${plan.name}`,
        created_at: now.toISOString()
      });

      // 3.5. Distribution immédiate des commissions de parrainage multi-niveaux (N1: 20%, N2: 2%, N3: 1%)
      try {
        await distributeInvestmentCommissions(user, requiredAmount, plan.name);
      } catch (comErr) {
        console.warn('Erreur calcul commissions:', comErr);
      }

      // 4. Synchronisation instantanée sur le serveur d'API interne (<5ms)
      try {
        await Promise.all([
          fetch('/api/investments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: investId,
              user_id: user.id,
              plan_amount: requiredAmount,
              daily_yield: Number(plan.daily),
              start_date: now.toISOString(),
              end_date: endsAt.toISOString(),
              last_paid_at: now.toISOString(),
              status: 'active'
            })
          }),
          fetch(`/api/users/${user.id}/balance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
          }),
          fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: txId,
              user_id: user.id,
              type: 'investment',
              amount: requiredAmount,
              status: 'approved',
              reference: `Souscription - ${plan.name}`,
              created_at: now.toISOString()
            })
          })
        ]);
      } catch (srvErr) {
        console.warn('Erreur synchro serveur interne:', srvErr);
      }

      // Synchronisation distante Supabase en tâche de fond discrète
      Promise.resolve(
        supabase.from('investments').insert([{
          id: investId,
          user_id: user.id,
          plan_amount: requiredAmount,
          daily_yield: Number(plan.daily),
          start_date: now.toISOString(),
          end_date: endsAt.toISOString(),
          last_paid_at: now.toISOString(),
          status: 'active'
        }])
      ).catch(() => {});

      await refreshUser();
      setActiveCount(prev => prev + 1);

      setMessage({
        type: 'success',
        text: `Félicitations ! Le véhicule "${plan.name}" a été activé avec succès. Vos dividendes quotidiens (${formatCurrency(plan.daily)}/jour) sont désormais en cours de rotation.`
      });

    } catch (err: any) {
      console.error('Subscription error:', err);
      setMessage({
        type: 'error',
        text: err?.message || "Une erreur s'est produite lors de la souscription."
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 transition-all">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <AppLogo imgClassName="h-9 w-auto object-contain max-h-10" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-full text-[11px] font-black text-emerald-800 shadow-sm">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Catalogue Flotte
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Direct Page Flow */}
      <div className="pt-3 max-w-xl mx-auto space-y-4">
        
        {/* Notifications */}
        {message && (
          <div className={`mx-4 sm:mx-0 p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold border transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <p className="leading-snug">{message.text}</p>
            </div>
            {message.type === 'success' ? (
              <Link 
                to="/activity" 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shrink-0 shadow-sm transition-all"
              >
                <span>Activité</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link 
                to="/deposit" 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg shrink-0 shadow-sm transition-all"
              >
                <span>Recharger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Mes Flottes actifs */}
        <div className="px-4 sm:px-0">
          <Link
            to="/activity"
            className="w-full bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow transition-all group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    Mes Flottes actifs
                  </span>
                  {activeCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>{activeCount} en service</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                      0 en service
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Suivi des véhicules en rotation et collecte des gains quotidiens
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Titre de section */}
        <div className="flex items-center justify-between px-4 sm:px-2 pt-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Plans Disponibles ({plans.length})
            </h2>
          </div>
        </div>

        {/* Liste des plans : simple, clair et propre */}
        <div className="space-y-3 px-3 sm:px-0">
          {plans.map((plan, index) => {
            const planKey = plan.id || `plan-${plan.amount}-${index}`;

            return (
              <div 
                key={planKey} 
                className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 transition-all ${
                  plan.locked 
                    ? 'opacity-60 bg-slate-50' 
                    : 'hover:border-emerald-500'
                }`}
              >
                {/* En-tête : Miniature + Nom + Durée */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img 
                      src={plan.image || '/icon.svg'} 
                      alt={plan.name} 
                      className={`w-full h-full object-cover ${plan.locked ? 'grayscale' : ''}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-emerald-600">
                        Formule N°{index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {plan.duration || 80} jours
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                      {plan.name}
                    </h3>
                  </div>
                </div>

                {/* Détails financiers nets, propres et lisibles */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Prix d'achat :</span>
                    <span className="font-bold text-slate-900">{formatCurrency(plan.amount)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Gain quotidien :</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(plan.daily)} / jour</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Gain total ({plan.duration || 80} jours) :</span>
                    <span className="font-bold text-slate-900">{formatCurrency(plan.total)}</span>
                  </div>
                </div>

                {/* Bouton d'action sobre */}
                <div>
                  {plan.locked ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 flex justify-center items-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" /> Indisponible
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInvest(plan, planKey)}
                      disabled={loading === planKey}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75"
                    >
                      {loading === planKey ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activation en cours...</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          <span>Activer ce véhicule</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
