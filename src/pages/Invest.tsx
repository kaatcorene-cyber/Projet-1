import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Lock, Sprout } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { CropPlan, DEFAULT_CROP_PLANS } from '../data/plans';

export type { CropPlan };
export const CROP_PLANS = DEFAULT_CROP_PLANS;

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const [plans, setPlans] = useState<CropPlan[]>(() => {
    try {
      const cached = localStorage.getItem('cargill_investment_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_CROP_PLANS;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    // Fetch unified investment plans from database settings
    async function fetchPlans() {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'investment_plans')
          .maybeSingle();

        if (data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = parsed.map((p: any, idx: number) => ({
              ...p,
              id: p.id || `crop_${p.amount || idx}_${idx}`
            }));
            setPlans(formatted);
            try {
              localStorage.setItem('cargill_investment_plans', JSON.stringify(formatted));
            } catch (err) {}
          }
        }
      } catch (e) {
        console.error('Failed to parse investment_plans setting', e);
      }
    }
    fetchPlans();

    const handlePlansUpdate = () => {
      try {
        const cached = localStorage.getItem('cargill_investment_plans');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('cargill_plans_updated', handlePlansUpdate);
    window.addEventListener('storage', handlePlansUpdate);

    const intervalId = setInterval(() => {
      refreshUser();
    }, 60000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('cargill_plans_updated', handlePlansUpdate);
      window.removeEventListener('storage', handlePlansUpdate);
    };
  }, [refreshUser]);

  const handleInvest = async (plan: CropPlan, planKey: string) => {
    if (!user) return;
    if (plan.locked) {
      setMessage({ type: 'error', text: 'Ce plan est actuellement verrouillé.' });
      return;
    }
    
    if (Number(user.balance) < plan.amount) {
      setMessage({ type: 'error', text: 'Solde insuffisant. Veuillez recharger votre compte.' });
      return;
    }

    setLoading(planKey);
    setMessage(null);

    try {
      const newBalance = Number(user.balance) - plan.amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const durationDays = plan.duration || 60;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const { error: invError } = await supabase
        .from('investments')
        .insert([{
          user_id: user.id,
          plan_amount: plan.amount,
          daily_yield: plan.daily,
          end_date: endDate.toISOString()
        }]);

      if (invError) throw invError;

      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'investment',
        amount: plan.amount,
        status: 'completed'
      }]);

      await refreshUser();
      setMessage({ type: 'success', text: `Culture de ${plan.name} lancée avec succès !` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Échec de la transaction. Veuillez réessayer.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-5 pt-6 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Culture</h1>
          <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider mt-0.5">Plans Agricoles Disponibles</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-10" />
      </header>

      <div className="relative z-10 max-w-xl mx-auto space-y-4 mt-4">
        {message && (
          <div className={`p-3.5 rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in duration-200 shadow-sm ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-500/20 text-emerald-800' : 'bg-red-50 border border-red-500/20 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />}
            <p className="text-xs font-bold">{message.text}</p>
          </div>
        )}

        {/* Solde utilisateur */}
        <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Votre solde disponible</p>
            <p className="text-xl font-black text-emerald-600">{formatCurrency(user?.balance || 0)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Sprout className="w-5 h-5" />
          </div>
        </div>

        {/* Plans de Culture */}
        <div className="space-y-4">
          {plans.map((plan, index) => {
            const planKey = plan.id || `crop-plan-${plan.amount}-${index}`;
            const hasEnoughBalance = (user?.balance || 0) >= plan.amount;

            return (
              <div 
                key={planKey} 
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm ${
                  plan.locked 
                    ? 'border-gray-200 bg-gray-50/70 opacity-90' 
                    : 'border-black/5 hover:border-emerald-500/30'
                }`}
              >
                {/* Image + Nom + Statut */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-black/10 bg-gray-100 relative">
                    <img 
                      src={plan.image || '/logo-icon.svg'} 
                      alt={plan.name} 
                      className={`w-full h-full object-cover transition-transform duration-300 ${plan.locked ? 'grayscale contrast-125' : 'hover:scale-105'}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo-icon.svg';
                      }}
                    />
                    {plan.locked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-gray-900 text-base tracking-tight truncate">
                          {plan.name}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                          Investissement : <span className="text-emerald-700 font-black">{formatCurrency(plan.amount)}</span>
                        </p>
                      </div>

                      {plan.locked ? (
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3" /> Verrouillé
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chiffres clés : Investissement / Gain par jour / Gains total */}
                <div className="rounded-xl p-3 bg-gray-50 border border-black/5 flex justify-between items-center text-center">
                  <div className="text-left">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Gain / jour</p>
                    <p className="text-emerald-600 font-black text-sm">{formatCurrency(plan.daily)}</p>
                  </div>
                  <div className="w-px h-7 bg-black/10"></div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Gain total</p>
                    <p className="text-gray-900 font-black text-sm">{formatCurrency(plan.total)}</p>
                  </div>
                  <div className="w-px h-7 bg-black/10"></div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Durée</p>
                    <p className="text-gray-700 font-black text-sm">{plan.duration} Jours</p>
                  </div>
                </div>

                {/* Bouton d'action */}
                <button
                  onClick={() => handleInvest(plan, planKey)}
                  disabled={loading === planKey || plan.locked || !hasEnoughBalance}
                  className={`w-full py-3 rounded-xl text-xs font-black transition-all flex justify-center items-center gap-1.5 ${
                    plan.locked
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                      : !hasEnoughBalance
                        ? 'bg-emerald-600/30 text-emerald-900 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-98'
                  }`}
                >
                  {loading === planKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : plan.locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Verrouillé
                    </>
                  ) : !hasEnoughBalance ? (
                    'Solde insuffisant'
                  ) : (
                    `Cultiver (${formatCurrency(plan.amount)})`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
