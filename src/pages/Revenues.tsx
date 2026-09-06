import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, getPlanName } from '../lib/utils';
import { Loader2, Clock, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CountdownTimer = ({ inv, plan, onRefresh }: { inv: any, plan: any, onRefresh?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);
  const { user, refreshUser } = useAuthStore();
  const [isClaiming, setIsClaiming] = useState(false);
  
  const canClaim = timeLeft && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const lastPaidAt = new Date(inv.last_paid_at || inv.start_date || inv.created_at).getTime();
      const targetDate = lastPaidAt + (24 * 60 * 60 * 1000); // 24 hours later
      const diff = targetDate - now;
      const totalDuration = 24 * 60 * 60 * 1000;
      let remaining = diff;

      if (remaining <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, percent: 100 });
        return;
      }

      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / 1000 / 60) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      
      let pct = (diff / totalDuration) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setTimeLeft({ h: hours, m: minutes, s: seconds, percent: pct });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
  
  return () => clearInterval(timer);
  }, [inv]);

  const handleClaim = async () => {
    if (!user || isClaiming || !canClaim) return;
    setIsClaiming(true);
    
    try {
      const { data: currentInv, error: invError } = await supabase.from('investments').select('last_paid_at, status').eq('id', inv.id).single();
      
      if (invError || !currentInv || currentInv.status !== 'active') {
        toast.error("Pack invalide ou expiré");
        return;
      }
      
      const now = new Date().getTime();
      const currentLastPaidAt = new Date(currentInv.last_paid_at || inv.start_date || inv.created_at).getTime();
      
      if (now - currentLastPaidAt < 24 * 60 * 60 * 1000) {
        toast.error("Pas encore disponible. Patientez.");
        if (onRefresh) onRefresh();
        return;
      }
      
      const claimAmount = Number(inv.daily_yield);
      const newPaidAt = new Date().toISOString();
      
      const { error: updateError } = await supabase.from('investments')
        .update({ last_paid_at: newPaidAt })
        .eq('id', inv.id)
        .eq('last_paid_at', currentInv.last_paid_at); 
        
      if (updateError) throw updateError;
      
      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'daily_gain',
        amount: claimAmount,
        status: 'completed',
        reference: inv.id
      }]);
      
      const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (userData) {
          await supabase.from('users').update({ balance: Number(userData.balance || 0) + claimAmount }).eq('id', user.id);
      }
      
      toast.success(`+${claimAmount} FCFA collectés avec succès !`);
      refreshUser();
      if (onRefresh) onRefresh();
    } catch (e) {
      toast.error("Erreur lors de la collecte");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!timeLeft) return null;

  return (
    <div className="bg-white/10 rounded-[24px] p-5 border border-white/20 shadow-sm flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
          <img referrerPolicy="no-referrer" src={getPlanImage(inv.plan_amount)} alt="Plan" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">{getPlanName(inv.plan_amount)}</span>
              <h3 className="text-xl font-black text-white leading-none">{formatCurrency(inv.plan_amount)}</h3>
            </div>
            <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-blue-200/60" />
              <span className="text-white/90 font-bold text-xs">{plan?.duration || 30} J</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
         <div className="flex flex-col bg-[#03296c] p-2 rounded-xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
            <span className="text-brand-600 font-black text-sm leading-none">{formatCurrency(inv.daily_yield)}</span>
         </div>
         <div className="flex flex-col bg-[#03296c] p-2 rounded-xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
            <span className="text-white font-black text-xs leading-none">{formatCurrency(Number(inv.daily_yield) * (plan?.duration || 30))}</span>
         </div>
      </div>

      <div className="pt-2">
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-black text-xs hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Collecter mes gains'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 bg-[#03296c] p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center w-full">
               <span className="text-[10px] text-blue-200/60 font-bold uppercase tracking-widest">Disponibilité dans</span>
               <div className="font-mono text-sm font-black text-white flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                 <Clock className="w-4 h-4 text-brand-500" />
                 <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
               </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                 className="h-full rounded-full transition-all duration-1000 ease-linear bg-brand-500 shadow-sm"
                 style={{ width: `${timeLeft.percent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





const getPlanImage = (amount) => {
  const amt = Number(String(amount).replace(/\D/g, ''));
  let emoji = '🍓';
  let c1 = '#ff758c';
  let c2 = '#ff7eb3';
  
  if (amt === 5000) { emoji = '🍉'; c1 = '#ff9a9e'; c2 = '#fecfef'; }
  else if (amt === 8000) { emoji = '🥝'; c1 = '#d4fc79'; c2 = '#96e6a1'; }
  else if (amt === 15000) { emoji = '🍇'; c1 = '#a18cd1'; c2 = '#fbc2eb'; }
  else if (amt === 35000) { emoji = '🍒'; c1 = '#ff0844'; c2 = '#ffb199'; }
  else if (amt === 80000) { emoji = '🍋'; c1 = '#f6d365'; c2 = '#fda085'; }
  else if (amt === 200000) { emoji = '🍏'; c1 = '#84fab0'; c2 = '#8fd3f4'; }
  else if (amt === 500000) { emoji = '🍌'; c1 = '#ffe259'; c2 = '#ffa751'; }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g${amt}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g${amt})" />
    <text y="55%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function Revenues() {
  const { user, setUser } = useAuthStore();
  const { investmentsCache, setInvestmentsCache, config } = useAppStore();
  const [investments, setInvestments] = useState<any[]>(investmentsCache || []);
  const plans = config?.investment_plans ? (typeof config.investment_plans === 'string' ? JSON.parse(config.investment_plans) : config.investment_plans) : [];
  
  const [isLoading, setIsLoading] = useState(!investmentsCache);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const activePlans = plans.filter((p: any) => p.isActive !== false).sort((a: any, b: any) => Number(String(a.amount).replace(/\D/g, '')) - Number(String(b.amount).replace(/\D/g, '')));

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (investmentsCache) {
      setInvestments(investmentsCache);
      setIsLoading(false);
    }
  }, [investmentsCache]);

  const fetchProducts = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
    if (data) {
      setInvestments(data);
      setInvestmentsCache(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    const intervalId = setInterval(fetchProducts, 60000 * 2);
    return () => clearInterval(intervalId);
  }, [user]);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    setLoadingPlan(index);
    setMessage(null);

    const planAmount = Number(String(plan.amount).replace(/\D/g, ''));
    const planDaily = Number(String(plan.daily).replace(/\D/g, ''));

    if (user.balance < planAmount) {
      setMessage({ type: 'error', text: 'Solde insuffisant pour ce pack.' });
      setLoadingPlan(null);
      return;
    }

    try {
      const newBalance = user.balance - planAmount;
      const { error: userError } = await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      if (userError) throw userError;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan.duration || 60));

      const { error: investError } = await supabase.from('investments').insert([{
        user_id: user.id, plan_amount: planAmount, daily_yield: planDaily, end_date: endDate.toISOString(), status: 'active'
      }]);
      if (investError) throw investError;

      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id, type: 'investment', amount: planAmount, status: 'completed', reference: `INV-${Date.now()}`
      }]);
      if (txError) throw txError;

      setUser({ ...user, balance: newBalance });
      setMessage({ type: 'success', text: 'Pack activé avec succès !' });
      fetchProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'activation.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#03296c] p-5 pt-12 pb-32 font-sans text-white relative">
      
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${message.type === 'success' ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      <div className="max-w-md mx-auto mb-8 text-center pt-4">
         <h1 className="text-2xl font-black text-white tracking-tight mb-3">Boutique de Jus</h1>
         <p className="text-blue-200/80 text-sm font-medium bg-white/5 inline-block px-4 py-2 rounded-full border border-white/10 shadow-sm">
           Investissez dans nos jus fruités pour générer des revenus 🍹
         </p>
      </div>

      <div className="max-w-md mx-auto space-y-4 mb-12">
        {activePlans.map((plan: any, idx: number) => {
          const hasInsufficientBalance = (user?.balance || 0) < plan.amount;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
                   <img referrerPolicy="no-referrer" src={getPlanImage(plan.amount)} alt="Plan" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start gap-2">
                     <div>
                       <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-0.5 block">{getPlanName(plan.amount)}</span>
                       <h3 className="text-xl font-black text-white leading-tight tracking-tight">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                       <Clock className="w-3.5 h-3.5 text-white" />
                       <span className="text-white/90 font-bold text-xs">{plan.duration || 30} J</span>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex-1 flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
                    <span className="text-brand-400 font-black text-xs">{formatCurrency(plan.daily)}</span>
                 </div>
                 <div className="flex-1 flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
                    <span className="text-white font-black text-xs">{formatCurrency(plan.total)}</span>
                 </div>
              </div>

              <button
                onClick={() => {
                  if (hasInsufficientBalance) {
                    setMessage({ type: 'error', text: 'Votre solde est insuffisant pour payer ce pack.' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    handleInvest(plan, idx);
                  }
                }}
                disabled={loadingPlan === idx}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${hasInsufficientBalance ? 'bg-white/5 text-blue-200/60 border border-white/10 active:scale-95' : 'bg-brand-500 text-white hover:bg-brand-400 active:scale-95 shadow-lg shadow-brand-500/20'}`}
              >
                {loadingPlan === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Payer'}
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
             <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : investments.length === 0 ? null : (
          <AnimatePresence mode="popLayout">
            {investments.map((inv, index) => {
              const plan = plans.find((p: any) => Number(String(p.amount).replace(/\D/g, '')) === Number(inv.plan_amount)) || {};
              return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CountdownTimer inv={inv} plan={plan} onRefresh={fetchProducts} />
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
