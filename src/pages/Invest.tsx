import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Gem, Coins } from 'lucide-react';

const DEFAULT_PLANS = [
  { category: 'basique', amount: 2500, daily: 450, total: 3600, image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800' },
  { category: 'basique', amount: 5000, daily: 900, total: 7200, image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800' },
  { category: 'basique', amount: 10000, daily: 1800, total: 14400, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800' },
  { category: 'premium', amount: 2500, daily: 125, total: 7500, image: 'https://images.unsplash.com/photo-1605374668853-2d2d6d841b52?auto=format&fit=crop&q=80&w=800' },
  { category: 'premium', amount: 5000, daily: 250, total: 15000, image: 'https://images.unsplash.com/photo-1542396601-dca920ea2807?auto=format&fit=crop&q=80&w=800' },
  { category: 'premium', amount: 10000, daily: 500, total: 30000, image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&q=80&w=800' },
];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [activeCategory, setActiveCategory] = useState<'basique' | 'premium'>('premium');

  useEffect(() => {
    if (settingsCache) {
      applyPlans(settingsCache);
    }
    fetchPlans();

    // Polling to keep user balance updated (Reduced frequency to save database quota)
    const intervalId = setInterval(() => {
      refreshUser();
      fetchPlans();
    }, 60000 * 2); // 2 minutes instead of 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const applyPlans = (data: any[]) => {
    const dbPlansStr = data.find(s => s.key === 'investment_plans');
    if (dbPlansStr && dbPlansStr.value) {
      try {
        const parsed = JSON.parse(dbPlansStr.value);
        // Ensure backward compatibility by applying a default category to old plans
        const migrated = parsed.map((p: any) => ({
          ...p,
          category: p.category || 'unique'
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
    .filter(p => (p.category || 'basique') === activeCategory)
    .sort((a, b) => a.amount - b.amount);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    
    if (Number(user.balance) < plan.amount) {
      setMessage({ type: 'error', text: 'Solde insuffisant. Veuillez recharger votre compte.' });
      return;
    }

    setLoading(index);
    setMessage(null);

    try {
      // 1. Deduct balance
      const newBalance = Number(user.balance) - plan.amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Create investment
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

      // 3. Record transaction
      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'investment',
        amount: plan.amount,
        status: 'completed'
      }]);

      await refreshUser();
      setMessage({ type: 'success', text: 'Minage réussi !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-5 pt-6 pb-20 min-h-screen bg-transparent">
      <header className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mine</h1>
          <p className="text-gray-500 text-xs font-medium mt-1 leading-relaxed opacity-90 italic">𝑨𝒄𝒉𝒆𝒕𝒆𝒛 𝒖𝒏𝒆 𝒎𝒊𝒏𝒆 𝒅’𝒐𝒓 𝒐𝒖 𝒅𝒆 𝒅𝒊𝒂𝒎𝒂𝒏𝒕 𝒆𝒕 𝒇𝒂𝒊𝒕𝒆𝒔 𝒇𝒓𝒖𝒄𝒕𝒊𝒇𝒊𝒆𝒓 𝒗𝒐𝒕𝒓𝒆 𝒄𝒂𝒑𝒊𝒕𝒂𝒍.</p>
        </div>
        <img src="https://i.imgur.com/bjYgoI6.png" alt="Logo" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-200 flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

      <div className="flex bg-gray-200/50 backdrop-blur-md rounded-2xl p-1.5 gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveCategory('premium')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold xl:text-base rounded-xl transition-all duration-300 ${
            activeCategory === 'premium' 
              ? 'bg-white text-gray-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] border border-gray-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Gem className={`w-4 h-4 ${activeCategory === 'premium' ? 'text-blue-500' : 'text-gray-400'}`} />
          Mine de Diamant
        </button>
        <button
          onClick={() => setActiveCategory('basique')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold xl:text-base rounded-xl transition-all duration-300 ${
            activeCategory === 'basique' 
              ? 'bg-white text-gray-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] border border-gray-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Coins className={`w-4 h-4 ${activeCategory === 'basique' ? 'text-amber-500' : 'text-gray-400'}`} />
          Mine d'Or
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      <div className="space-y-4 animate-fade-in relative z-10 pb-6">
          {activePlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">Aucun plan disponible dans cette catégorie.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => {
              const isPremiumPlan = activeCategory === 'premium';
              
              return (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 hover:shadow-lg transition-all group relative">
                  <div className={`absolute top-0 left-0 h-full w-1 ${isPremiumPlan ? 'bg-gradient-to-b from-blue-400 to-indigo-500' : 'bg-gradient-to-b from-amber-300 to-orange-400'}`}></div>
                  <div className="p-4 flex gap-4 items-center">
                    <div className="w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden shrink-0 shadow-inner border border-gray-100/50 bg-gray-50">
                      <img src={plan.image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800'} alt="Plan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xl font-bold text-gray-900 tracking-tight truncate">{formatCurrency(plan.amount)}</p>
                        <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${
                          isPremiumPlan ? 'text-blue-700 bg-blue-50/80 border-blue-200/60' : 'text-amber-700 bg-amber-50/80 border-amber-200/60'
                        }`}>
                          {plan.duration || 60} Jours
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm mt-3.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Gain/Jour</p>
                          <p className={`font-semibold text-sm ${isPremiumPlan ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(plan.daily)}</p>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total</p>
                          <p className="font-semibold text-sm text-gray-900">{formatCurrency(plan.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4 pt-1">
                    <button
                      onClick={() => handleInvest(plan, idx)}
                      disabled={loading === idx || (user?.balance || 0) < plan.amount}
                      className="w-full py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white flex justify-center items-center bg-gray-900 hover:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] active:scale-[0.98]"
                    >
                      {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Miner'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
    </div>
  );
}

