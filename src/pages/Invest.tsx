import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Gem, Coins } from 'lucide-react';

const DEFAULT_PLANS: any[] = [];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

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
        setPlans(parsed);
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

  const activePlans = [...plans].sort((a, b) => a.amount - b.amount);

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
      setMessage({ type: 'success', text: 'Souscription réussie !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-5 pt-6 pb-20 min-h-screen bg-transparent">
      <header className="flex justify-between items-center gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight">Contrats</h1>
        </div>
        <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-zinc-800 flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

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
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 text-center shadow-md">
              <p className="text-zinc-400 font-medium">Aucun plan disponible dans cette catégorie.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => {              
              return (
                <div key={idx} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/30 transition-all group relative">
                  <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-orange-400 to-red-600`}></div>
                  <div className="p-4 flex gap-4 items-center">
                    <div className="w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden shrink-0 shadow-inner border border-zinc-800/50 bg-zinc-800/50">
                      <img src={plan.image || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800'} alt="Plan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xl font-bold text-zinc-50 tracking-tight truncate">{formatCurrency(plan.amount)}</p>
                        <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border text-red-400 bg-red-500/10 border-red-500/20 shadow-inner`}>
                          {plan.duration || 60} Jours
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm mt-3.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Gain/Jour</p>
                          <p className={`font-semibold text-sm text-orange-500 tracking-tight`}>{formatCurrency(plan.daily)}</p>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Total</p>
                          <p className="font-semibold text-sm text-zinc-50 tracking-tight">{formatCurrency(plan.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4 pt-1">
                    <button
                      onClick={() => handleInvest(plan, idx)}
                      disabled={loading === idx || (user?.balance || 0) < plan.amount}
                      className="w-full py-3.5 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white flex justify-center items-center bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] border border-red-500/50"
                    >
                      {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Souscrire'}
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

