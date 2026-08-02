import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Activity, ChevronLeft, Gem, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ContractVisual: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center bg-slate-100/80 rounded-2xl border border-slate-300/50 overflow-hidden shrink-0 shadow-inner">
      <div className={`absolute inset-0 opacity-20 blur-2xl bg-orange-600`}></div>
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 border-slate-200/50 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-md`}>
           <Zap className="w-6 h-6 text-orange-600" />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 origin-center rounded-full border-2 border-dashed border-transparent"
        style={{ borderTopColor: 'rgba(16, 185, 129, 0.4)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

const CountdownTimer: React.FC<{ inv: any }> = ({ inv }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startDate = new Date(inv.start_date || inv.created_at).getTime();
      const timeElapsed = Math.max(0, now - startDate);
      const daysElapsed = Math.floor(timeElapsed / (24 * 60 * 60 * 1000));
      const nextPay = startDate + (daysElapsed + 1) * (24 * 60 * 60 * 1000);
      
      const diff = nextPay - now;
      
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, percent: 100 });
        return;
      }
      
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = timeElapsed % totalDuration;
      let pct = (elapsed / totalDuration) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setTimeLeft({ h: hours, m: minutes, s: seconds, percent: pct });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [inv]);

  if (!timeLeft) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-5 relative overflow-hidden flex items-center gap-5">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none bg-orange-600/10`}></div>
      
      <ContractVisual />

      <div className="flex-1 z-10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
            Plan <span className="w-1 h-1 rounded-full bg-zinc-600"></span> {formatCurrency(inv.plan_amount || 0)}
          </p>
          <div className="flex gap-1.5 items-center bg-orange-600/10 px-2 py-1 rounded-lg border border-orange-600/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Actif</span>
          </div>
        </div>
        
        <div className="font-mono text-3xl font-black text-slate-900 tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-zinc-600 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-zinc-600 mx-1 mb-1">:</span>
          <span className="text-orange-600">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
        
        <div className="mt-4 w-full bg-slate-100/80 rounded-full h-2 overflow-hidden border border-slate-200">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-orange-700 to-orange-600" 
            style={{ width: `${timeLeft.percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function Products() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { investmentsCache, setInvestmentsCache } = useAppStore();
  const [investments, setInvestments] = useState<any[]>(investmentsCache || []);
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
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans animate-fade-in text-slate-900">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contrats Actifs</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Vos investissements</p>
        </div>
      </header>

      <div className="max-w-md mx-auto space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-10 h-10 rounded-full border-4 border-orange-600/20 border-t-orange-600 animate-spin"></div>
          </div>
        ) : investments.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-slate-400">Aucun contrat</h3>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {investments.map((inv, index) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.4 }}
              >
                <CountdownTimer inv={inv} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
