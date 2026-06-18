import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Activity, ChevronLeft, Gem, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';

const ContractVisual: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center bg-zinc-800/80 rounded-2xl border border-zinc-700/50 overflow-hidden shrink-0 shadow-inner">
      <div className={`absolute inset-0 opacity-20 blur-2xl bg-red-500`}></div>
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-md`}>
           <Zap className="w-6 h-6 text-red-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 origin-center rounded-full border-2 border-dashed border-transparent"
        style={{ borderTopColor: 'rgba(239, 68, 68, 0.4)' }}
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
      const lastPaid = new Date(inv.last_paid_at || inv.created_at).getTime();
      const nextPay = lastPaid + (24 * 60 * 60 * 1000); // 24 hours later
      
      const diff = nextPay - now;
      
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, percent: 100 });
        return;
      }
      
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = now - lastPaid;
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
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-3xl p-5 relative overflow-hidden flex items-center gap-5">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none bg-red-500/10`}></div>
      
      <ContractVisual />

      <div className="flex-1 z-10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
            Plan <span className="w-1 h-1 rounded-full bg-zinc-600"></span> {formatCurrency(inv.plan_amount || 0)}
          </p>
          <div className="flex gap-1.5 items-center bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Actif</span>
          </div>
        </div>
        
        <div className="font-mono text-3xl font-black text-zinc-50 tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-zinc-600 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-zinc-600 mx-1 mb-1">:</span>
          <span className="text-orange-500">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
        
        <div className="mt-4 w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-zinc-800">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-orange-600 to-red-500" 
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
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans animate-fade-in text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contrats Actifs</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Vos investissements</p>
        </div>
      </header>

      <div className="max-w-md mx-auto space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-10 h-10 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin"></div>
          </div>
        ) : investments.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 border border-zinc-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>

            <div className="w-24 h-24 bg-zinc-800 border border-zinc-700/50 rounded-2xl flex items-center justify-center mb-8 shadow-inner relative z-10">
              <Activity className="w-10 h-10 text-zinc-500" />
            </div>
            
            <h3 className="text-2xl font-black text-zinc-50 mb-3 relative z-10">Aucun contrat</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed relative z-10">Investissez dans un plan pour commencer à générer des revenus chaque jour.</p>
            
            <button 
              onClick={() => navigate('/invest')}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all text-base flex items-center justify-center gap-2 relative z-10"
            >
              <Zap className="w-5 h-5" />
              Voir les plans
            </button>
          </div>
        ) : (
          investments.map(inv => (
            <CountdownTimer key={inv.id} inv={inv} />
          ))
        )}
      </div>
    </div>
  );
}
