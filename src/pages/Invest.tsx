import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
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
    <div className="min-h-[100dvh] bg-white font-sans text-neutral-900 pb-24 overflow-x-hidden relative">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Dynamic Header */}
      <div className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-30 border-b border-neutral-200 rounded-none rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Nos Parcs Actifs</h1>
            <p className="text-neutral-500 font-medium text-xs mt-0.5">Achetez et générez des rendements</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 shadow-sm overflow-hidden p-1">
              <img src="https://i.imgur.com/HfAOyni.jpeg" alt="SIM" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-xl mx-auto space-y-8 relative z-10">
        
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm border ${
              message.type === 'success' ? 'bg-brand/5 border-brand/20 text-brand' : 'bg-red-50 border-red-200 text-brand'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-bold">{message.text}</p>
          </motion.div>
        )}



        <div className="space-y-5">
          {activePlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200 shadow-sm">
              <p className="text-neutral-500 font-medium text-sm">Réseau indisponible, réessayez plus tard.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => {
              const isBonus = plan.isBonus || plan.amount === 1500;
              const bonusStockLimit = 100;
              const stockRemaining = isBonus ? Math.max(0, bonusStockLimit - bonusCount) : null;
              const isAvailable = isBonus ? stockRemaining! > 0 : true;

              return (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx} 
                  className={`border rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden transition-all shadow-sm ${isBonus ? 'bg-[#c40828] border-[#a0001d] text-white shadow-[0_8px_30px_rgba(196,8,40,0.5)]' : 'bg-brand border-brand/80 text-white shadow-[0_8px_30px_rgba(229,9,47,0.3)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                  {/* Basic Info */}
                  <div className="flex items-center justify-between relative z-10">
                     <div>
                       <p className="text-[10px] uppercase tracking-widest font-black mb-1 text-white/80 drop-shadow-sm">{isBonus ? 'Offre Spéciale' : 'Standard'}</p>
                       <h3 className="font-black text-2xl tracking-tight text-white drop-shadow-md">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm shrink-0 border border-white/20 bg-white/10 p-1">
                       <img 
                         src={plan.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'} 
                         alt="Générateur" 
                         className="w-full h-full object-cover rounded-lg" 
                         referrerPolicy="no-referrer" 
                       />
                     </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center bg-black/10 rounded-xl p-3 border border-white/10 relative z-10">
                    <div className="text-center">
                       <p className="text-white/70 text-[9px] uppercase tracking-wider font-bold mb-0.5">Gain/Jour</p>
                       <p className="text-white font-black text-sm">{formatCurrency(plan.daily)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-center">
                       <p className="text-white/70 text-[9px] uppercase tracking-wider font-bold mb-0.5">Total</p>
                       <p className="text-white font-bold text-sm">{formatCurrency(plan.total)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-center">
                       <p className="text-white/70 text-[9px] uppercase tracking-wider font-bold mb-0.5">Validité</p>
                       <p className="text-white font-bold text-sm">{plan.duration || 60} J</p>
                    </div>
                  </div>

                  {/* Actions & Stock */}
                  <div className="flex gap-2 items-center relative z-10">
                    {isBonus && stockRemaining !== null && (
                      <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-3 rounded-xl border flex-1 text-center ${stockRemaining > 0 ? 'bg-white/20 text-white border-white/30' : 'bg-black/20 text-white/50 border-white/10'}`}>
                        {stockRemaining > 0 ? `${stockRemaining} restants` : 'Épuisé'}
                      </div>
                    )}
                    <button
                      onClick={() => handleInvest(plan, idx)}
                      disabled={loading === idx || (user?.balance || 0) < plan.amount || !isAvailable}
                      className={`py-3 px-4 rounded-xl font-black uppercase tracking-wider transition-all flex justify-center items-center text-xs active:scale-[0.98] ${isBonus && stockRemaining !== null ? 'w-auto flex-1' : 'w-full'} ${
                        !isAvailable 
                          ? 'bg-black/20 text-white/50 border border-white/10' 
                          : 'bg-white hover:bg-neutral-100 text-brand shadow-[0_2px_8px_0_rgba(0,0,0,0.1)] disabled:bg-white/50 disabled:shadow-none'
                      }`}
                    >
                      {loading === idx ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      ) : (
                        !isAvailable ? 'Épuisé' : 'Acheter'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

