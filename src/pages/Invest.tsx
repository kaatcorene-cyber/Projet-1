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
      const durationDays = Math.round(plan.total / plan.daily) || 60; // fallback to 60 if unexpected daily=0
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
    <div className="p-6 space-y-6 pt-20 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investissements</h1>
        </div>
        <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
          <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {isInitializing ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {activePlans.length === 0 ? (
            <div className="bg-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
              <p className="text-white/70 font-medium">Aucun plan disponible dans cette catégorie.</p>
            </div>
          ) : (
            activePlans.map((plan, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="h-32 w-full relative overflow-hidden">
                  <img src={plan.image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800'} alt="Plan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/40 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/30 shadow-sm">
                    <p className="text-white font-bold text-xs">
                      60 jours
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <p className="text-white font-black text-3xl drop-shadow-md">{formatCurrency(plan.amount)}</p>
                  </div>
                </div>
                
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Gain Journalier</p>
                      <p className="font-bold text-xl leading-none text-emerald-600">{formatCurrency(plan.daily)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Revenu Total</p>
                      <p className="text-gray-900 font-bold text-xl leading-none">{formatCurrency(plan.total)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleInvest(plan, idx)}
                    disabled={loading === idx || (user?.balance || 0) < plan.amount}
                    className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white flex justify-center items-center active:scale-95 shadow-md hover:shadow-lg disabled:hover:scale-100 disabled:active:scale-100 bg-gradient-to-r from-emerald-500 to-emerald-600"
                  >
                    {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Investir ce montant'}
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
