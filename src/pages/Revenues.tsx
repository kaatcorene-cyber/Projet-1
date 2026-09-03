import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, getPlanName } from '../lib/utils';
import { Loader2, Clock, Zap } from 'lucide-react';
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
    <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">{getPlanName(inv.plan_amount)}</span>
          <h3 className="text-xl font-black text-slate-900 leading-none">{formatCurrency(inv.plan_amount)}</h3>
        </div>
        <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-sm">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-slate-700 font-bold text-xs">{plan?.duration || 30} Jrs</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
         <div className="flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
            <span className="text-brand-600 font-black text-sm leading-none">{formatCurrency(inv.daily_yield)}</span>
         </div>
         <div className="flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase mb-1">Gain total</span>
            <span className="text-slate-900 font-black text-sm leading-none">{formatCurrency(Number(inv.daily_yield) * (plan?.duration || 30))}</span>
         </div>
      </div>

      <div className="pt-2">
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-black text-sm hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Collecter mes gains'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center w-full">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Disponibilité dans</span>
               <div className="font-mono text-sm font-black text-slate-900 flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                 <Clock className="w-4 h-4 text-brand-500" />
                 <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
               </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
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

export function Revenues() {
  const { user } = useAuthStore();
  const { investmentsCache, setInvestmentsCache, config } = useAppStore();
  const [investments, setInvestments] = useState<any[]>(investmentsCache || []);
  const plans = config?.investment_plans ? (typeof config.investment_plans === 'string' ? JSON.parse(config.investment_plans) : config.investment_plans) : [];
  const [isLoading, setIsLoading] = useState(!investmentsCache);

  useEffect(() => {
    if (investmentsCache) {
      setInvestments(investmentsCache);
      setIsLoading(false);
    }
  }, [investmentsCache]);


  useEffect(() => {
    if (user?.id) {
      const fetchProducts = async () => {
        const { data } = await supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
        if (data) {
          setInvestments(data);
          setInvestmentsCache(data);
        }
        setIsLoading(false);
      };
      
      fetchProducts();
      
      const intervalId = setInterval(() => {
        fetchProducts();
      }, 60000 * 2);
      
      return () => clearInterval(intervalId);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-5 pt-12 pb-32 font-sans text-slate-900 relative">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Mes Packs Actifs</h1>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Collectez vos gains journaliers</p>
      </header>

      <div className="max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : investments.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-lg font-bold text-slate-500">Aucun pack actif</h3>
          </div>
        ) : (
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
                <CountdownTimer inv={inv} plan={plan} onRefresh={() => {
                  const fetchProducts = async () => {
                    const { data } = await supabase.from('investments').select('*').eq('user_id', user?.id).eq('status', 'active');
                    if (data) {
                      setInvestments(data);
                      setInvestmentsCache(data);
                    }
                  };
                  fetchProducts();
                }} />
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
