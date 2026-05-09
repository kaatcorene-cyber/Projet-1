import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Sun, Zap, PanelTop, BatteryCharging, ShieldAlert } from 'lucide-react';

const DEFAULT_PLANS = [
  { category: 'basique', amount: 2500, daily: 450, total: 3600, image: 'https://i.imgur.com/TPu2aYa.jpeg' },
  { category: 'basique', amount: 5000, daily: 900, total: 7200, image: 'https://i.imgur.com/13CtIKN.jpeg' },
  { category: 'basique', amount: 10000, daily: 1800, total: 14400, image: 'https://i.imgur.com/gK4vxdm.jpeg' },
  { category: 'premium', amount: 2500, daily: 125, total: 7500, image: 'https://i.imgur.com/tDxIhSt.jpeg' },
  { category: 'premium', amount: 5000, daily: 250, total: 15000, image: 'https://i.imgur.com/TH31utuh.jpg' },
  { category: 'premium', amount: 10000, daily: 500, total: 30000, image: 'https://i.imgur.com/EmiQxnA.jpeg' },
  { category: 'bonus', amount: 1500, daily: 180, total: 10800, duration: 60, isBonus: true, image: '' }
];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [bonusCount, setBonusCount] = useState<number>(0);

  useEffect(() => {
    if (settingsCache) {
      applyPlans(settingsCache);
    }
    fetchPlans();
    fetchBonusCount();

    const intervalId = setInterval(() => {
      refreshUser();
      fetchPlans();
      fetchBonusCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchBonusCount = async () => {
    const { count } = await supabase.from('investments').select('*', { count: 'exact', head: true }).eq('plan_amount', 1500);
    if (count !== null) setBonusCount(count);
  };

  const applyPlans = (data: any[]) => {
    const dbPlansStr = data.find(s => s.key === 'investment_plans');
    if (dbPlansStr && dbPlansStr.value) {
      try {
        const parsed = JSON.parse(dbPlansStr.value);
        const migrated = parsed.map((p: any) => ({
          ...p,
          category: p.category || 'basique'
        }));
        setPlans(migrated);
      } catch (e) {
        setPlans(DEFAULT_PLANS);
      }
    } else {
      setPlans(DEFAULT_PLANS);
    }
  };

  const fetchPlans = async () => {
    const { data: dbPlansStr } = await supabase.from('settings').select('*');
    if (dbPlansStr) {
      setSettingsCache(dbPlansStr);
      applyPlans(dbPlansStr);
    } else if (!settingsCache) {
      setPlans(DEFAULT_PLANS);
    }
  };

  const activePlans = plans.sort((a, b) => {
    if (a.isBonus && !b.isBonus) return -1;
    if (!a.isBonus && b.isBonus) return 1;
    return a.amount - b.amount;
  });

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    
    if (Number(user.balance) < plan.amount) {
      setMessage({ type: 'error', text: 'Solde insuffisant. Veuillez recharger votre compte.' });
      return;
    }

    setLoading(index);
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
      await fetchBonusCount();
      setMessage({ type: 'success', text: 'Générateur déployé avec succès !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Échec du déploiement.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-5 pt-16 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <header className="flex justify-between items-end pb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Générateurs</h1>
          <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">Parc Solaire Actif</p>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
      </header>

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-200 shadow-xl ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="space-y-5">
          {activePlans.length === 0 ? (
            <div className="bg-[#111] rounded-3xl p-8 text-center shadow-inner border border-white/5">
              <p className="text-gray-500 font-medium text-sm">Réseau indisponible, réessayez plus tard.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => {
              const isBonus = plan.isBonus || plan.amount === 1500;
              const bonusStockLimit = 100;
              const stockRemaining = isBonus ? Math.max(0, bonusStockLimit - bonusCount) : null;
              const isAvailable = isBonus ? stockRemaining! > 0 : true;

              return (
                <div key={idx} className={`bg-[#111] border rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden ${isBonus ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] mt-4 mb-2' : 'border-white/5'}`}>
                  {/* Glowing background for bonus */}
                  {isBonus && (
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#1a1a1a] relative group">
                      {isBonus ? (
                        <div className="w-full h-full relative bg-gradient-to-br from-[#2a1b0a] to-[#0a0602] flex items-center justify-center p-2 border border-amber-500/30">
                          {/* Simulated image element */}
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-sm uppercase whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                            BONUS
                          </div>
                          <div className="flex flex-col items-center justify-center mt-3 scale-[0.85]">
                            <Sun className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            <span className="text-[7px] font-black whitespace-nowrap mt-1 text-white tracking-tighter">SOLEIL<span className="text-amber-500">-POWER</span></span>
                          </div>
                          {stockRemaining !== null && stockRemaining > 0 && (
                             <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm py-1 border-t border-amber-500/20 text-center">
                               <p className="text-[9px] font-bold text-amber-500">RES: {stockRemaining}</p>
                             </div>
                          )}
                          {stockRemaining !== null && stockRemaining <= 0 && (
                             <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                               <span className="text-[10px] font-bold text-red-500 uppercase rotate-[-20deg] border border-red-500 px-1 py-0.5">ÉPUISÉ</span>
                             </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full">
                          <img src={plan.image || '/icon.svg'} alt="Générateur Solaire" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold text-lg ${isBonus ? 'text-amber-400' : 'text-white'}`}>{formatCurrency(plan.amount)}</h3>
                          <p className="text-gray-400 text-sm">{isBonus ? 'Générateur Spécial' : 'Générateur Solaire'}</p>
                        </div>
                        {isBonus && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md border border-amber-500/20 whitespace-nowrap uppercase tracking-wider">Édition Limitée</span>
                            {stockRemaining !== null && (
                              <span className={`text-[10px] font-semibold mt-1 ${stockRemaining > 0 ? 'text-gray-400' : 'text-red-400'}`}>
                                {stockRemaining > 0 ? `${stockRemaining} restants` : 'Stock épuisé'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats - minimal */}
                  <div className={`rounded-xl p-3 flex justify-between items-center border relative z-10 ${isBonus ? 'bg-amber-950/20 border-amber-500/20' : 'bg-[#1a1a1a] border-white/5'}`}>
                    <div>
                       <p className="text-gray-500 text-xs mb-0.5">Quotidien</p>
                       <p className="text-amber-500 font-semibold">{formatCurrency(plan.daily)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center">
                       <p className="text-gray-500 text-xs mb-0.5">Total</p>
                       <p className="text-white font-semibold">{formatCurrency(plan.total)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-right">
                       <p className="text-gray-500 text-xs mb-0.5">Durée</p>
                       <p className="text-white font-semibold">{plan.duration || 60} Jours</p>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleInvest(plan, idx)}
                    disabled={loading === idx || (user?.balance || 0) < plan.amount || !isAvailable}
                    className={`w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center relative z-10 ${
                      !isAvailable 
                        ? 'bg-[#1a1a1a] text-gray-400 border border-white/5' 
                        : isBonus
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {loading === idx ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      !isAvailable ? 'Stock Épuisé' : 'Investir'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

