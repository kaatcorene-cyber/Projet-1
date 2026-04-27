import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  const [isInitializing, setIsInitializing] = useState(!settingsCache);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (settingsCache) {
      applyPlans(settingsCache);
    }
    fetchPlans();

    // Polling to keep user balance updated
    const intervalId = setInterval(() => {
      refreshUser();
      fetchPlans();
    }, 5000);

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
    setIsInitializing(false);
  };

  const activePlans = plans.sort((a, b) => a.amount - b.amount);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    
    if (user.balance < plan.amount) {
      setMessage({ type: 'error', text: 'Solde insuffisant. Veuillez recharger votre compte.' });
      return;
    }

    setLoading(index);
    setMessage(null);

    try {
      // 1. Deduct balance
      const newBalance = user.balance - plan.amount;
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
      setMessage({ type: 'success', text: 'Investissement réussi !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-5 space-y-6 pt-16 pb-24 min-h-screen bg-gray-50">
      <header className="flex justify-between items-end pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Investissements</h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Développez votre capital</p>
        </div>
        <img src="https://i.imgur.com/awFyFRj.png" alt="QUALCOMM" className="h-6 object-contain" referrerPolicy="no-referrer" />
      </header>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {isInitializing ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {activePlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">Aucun plan disponible dans cette catégorie.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-red-600"></div>
                <div className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <img src={plan.image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800'} alt="Plan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(plan.amount)}</p>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 border border-red-100">
                        {plan.duration || 60} Jours
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-3">
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Gain/Jour</p>
                        <p className="font-semibold text-red-600">{formatCurrency(plan.daily)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(plan.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleInvest(plan, idx)}
                    disabled={loading === idx || (user?.balance || 0) < plan.amount}
                    className="w-full py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 text-white flex justify-center items-center bg-red-600 hover:bg-red-700"
                  >
                    {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Investir'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
