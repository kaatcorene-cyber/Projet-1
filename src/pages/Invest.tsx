import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PLANS = [
  { amount: 2500, daily: 375, total: 22500, image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800' },
  { amount: 5000, daily: 750, total: 45000, image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800' },
  { amount: 10000, daily: 1500, total: 90000, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800' },
  { amount: 15000, daily: 2250, total: 135000, image: 'https://images.unsplash.com/photo-1605374668853-2d2d6d841b52?auto=format&fit=crop&q=80&w=800' },
  { amount: 20000, daily: 3000, total: 180000, image: 'https://images.unsplash.com/photo-1542396601-dca920ea2807?auto=format&fit=crop&q=80&w=800' },
  { amount: 30000, daily: 4500, total: 270000, image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&q=80&w=800' },
  { amount: 40000, daily: 6000, total: 360000, image: 'https://images.unsplash.com/photo-1613521140712-1ce809e6c646?auto=format&fit=crop&q=80&w=800' },
  { amount: 50000, daily: 7500, total: 450000, image: 'https://images.unsplash.com/photo-1512402986470-8772a0c64998?auto=format&fit=crop&q=80&w=800' },
  { amount: 75000, daily: 11250, total: 675000, image: 'https://images.unsplash.com/photo-1590496793907-471d09cb2c4b?auto=format&fit=crop&q=80&w=800' },
  { amount: 100000, daily: 15000, total: 900000, image: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?auto=format&fit=crop&q=80&w=800' },
  { amount: 150000, daily: 22500, total: 1350000, image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800' },
  { amount: 200000, daily: 30000, total: 1800000, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleInvest = async (plan: typeof PLANS[0], index: number) => {
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
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);

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

      // 4. Handle Referrals (simplified for prototype)
      if (user.referred_by) {
        // Find referrer
        const { data: referrer } = await supabase
          .from('users')
          .select('id, balance')
          .eq('referral_code', user.referred_by)
          .single();
        
        if (referrer) {
          const bonus = plan.amount * 0.25; // 25% level 1
          await supabase.from('users').update({ balance: referrer.balance + bonus }).eq('id', referrer.id);
          await supabase.from('transactions').insert([{
            user_id: referrer.id,
            type: 'referral_bonus',
            amount: bonus,
            status: 'completed'
          }]);
        }
      }

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
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investissements</h1>
          <p className="text-gray-500 text-sm mt-1">Durée : 60 jours • Rendement : 15% / jour</p>
        </div>
        <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
      </header>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-4">
        {PLANS.map((plan, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="h-32 w-full relative">
              <img src={plan.image} alt="Station" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-2xl">{formatCurrency(plan.amount)}</p>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Gain Journalier</p>
                  <p className="text-emerald-500 font-bold">{formatCurrency(plan.daily)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Revenu Total</p>
                  <p className="text-gray-900 font-bold">{formatCurrency(plan.total)}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleInvest(plan, idx)}
                disabled={loading === idx || (user?.balance || 0) < plan.amount}
                className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loading === idx ? 'Traitement...' : 'Investir maintenant'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
