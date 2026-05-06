import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Sun, Zap, PanelTop, BatteryCharging } from 'lucide-react';

const DEFAULT_PLANS = [
  { category: 'basique', amount: 2500, daily: 450, total: 3600, image: 'https://i.imgur.com/TPu2aYa.jpeg' },
  { category: 'basique', amount: 5000, daily: 900, total: 7200, image: 'https://i.imgur.com/13CtIKN.jpeg' },
  { category: 'basique', amount: 10000, daily: 1800, total: 14400, image: 'https://i.imgur.com/gK4vxdm.jpeg' },
  { category: 'premium', amount: 2500, daily: 125, total: 7500, image: 'https://i.imgur.com/tDxIhSt.jpeg' },
  { category: 'premium', amount: 5000, daily: 250, total: 15000, image: 'https://i.imgur.com/TH31utuh.jpg' },
  { category: 'premium', amount: 10000, daily: 500, total: 30000, image: 'https://i.imgur.com/EmiQxnA.jpeg' },
];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(!settingsCache);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (settingsCache) {
      applyPlans(settingsCache);
    }
    fetchPlans();

    const intervalId = setInterval(() => {
      refreshUser();
      fetchPlans();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

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
    setIsInitializing(false);
  };

  const activePlans = plans
    .sort((a, b) => a.amount - b.amount);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    
    if (Number(user.balance) < plan.amount) {
      setMessage({ type: 'error', text: 'Énergie insuffisante. Veuillez recharger votre station.' });
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

        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <Sun className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-amber-500 font-bold tracking-widest text-xs uppercase animate-pulse">Synchronisation des panneaux...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-safe">
            {activePlans.length === 0 ? (
              <div className="col-span-2 bg-[#111] rounded-2xl p-8 text-center border border-white/5">
                <p className="text-gray-500 font-medium text-sm">Réseau indisponible, réessayez plus tard.</p>
              </div>
            ) : (
              activePlans.map((plan, idx) => (
                <div key={idx} className="bg-[#111] border border-white/10 rounded-2xl p-3 flex flex-col relative">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-white font-bold">{formatCurrency(plan.amount)}</span>
                     <span className="text-gray-500 text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{plan.duration || 60}J</span>
                   </div>
                   <div className="text-amber-500 text-xs font-medium mb-3">
                     +{formatCurrency(plan.daily)}<span className="text-gray-500 text-[10px]">/jour</span>
                   </div>
                   <div className="text-gray-400 text-[10px] mb-3">
                     Total: {formatCurrency(plan.total)}
                   </div>
                   <button
                      onClick={() => handleInvest(plan, idx)}
                      disabled={loading === idx || (user?.balance || 0) < plan.amount}
                      className="w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 text-black bg-amber-500 hover:bg-amber-400 flex items-center justify-center mt-auto"
                    >
                      {loading === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Investir'}
                   </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
