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
  
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
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

        <div className="space-y-5">
          {activePlans.length === 0 ? (
            <div className="bg-[#111] rounded-3xl p-8 text-center shadow-inner border border-white/5">
              <p className="text-gray-500 font-medium text-sm">Réseau indisponible, réessayez plus tard.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => (
              <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#1a1a1a]">
                    <img src={plan.image || '/icon.svg'} alt="Générateur Solaire" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{formatCurrency(plan.amount)}</h3>
                    <p className="text-gray-400 text-sm">Générateur Solaire</p>
                  </div>
                </div>

                {/* Stats - minimal */}
                <div className="bg-[#1a1a1a] rounded-xl p-3 flex justify-between items-center border border-white/5">
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
                  disabled={loading === idx || (user?.balance || 0) < plan.amount}
                  className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-black bg-amber-500 hover:bg-amber-400 flex justify-center items-center"
                >
                  {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Investir'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
