import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Zap, PackageCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CountdownTimer: React.FC<{ inv: any }> = ({ inv }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      
      const startDateRaw = inv.start_date || inv.created_at;
      let start = new Date(startDateRaw).getTime();
      if (isNaN(start)) start = now;

      const daysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
      const nextPayout = start + (daysElapsed + 1) * 24 * 60 * 60 * 1000;

      const diff = nextPayout - now;
      const totalMs = 24 * 60 * 60 * 1000;
      const progressPercent = ((totalMs - diff) / totalMs) * 100;

      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
        percent: Math.max(0, Math.min(100, progressPercent))
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [inv]);

  if (!timeLeft) return null;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft.percent / 100) * circumference;

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden flex items-center gap-5 border border-gray-100">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-16 h-16 transform -rotate-90 drop-shadow-sm" viewBox="0 0 64 64">
          <circle 
            className="text-gray-100" 
            strokeWidth="4" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="32" 
            cy="32" 
          />
          <circle 
            className="text-purple-500 transition-all duration-1000 ease-linear" 
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="32" 
            cy="32" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-500" />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Plan {inv.plan_amount} FCFA</p>
          <div className="flex gap-1.5 items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Actif</span>
          </div>
        </div>
        
        <div className="font-mono text-2xl font-black text-gray-900 tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-gray-400 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-gray-400 mx-1 mb-1">:</span>
          <span className="text-purple-500">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}

export function Products() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      const fetchProducts = async () => {
        const { data } = await supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
        if (data) {
          setInvestments(data);
        }
      };
      
      fetchProducts();
      
      const intervalId = setInterval(() => {
        fetchProducts();
      }, 60000 * 2);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans animate-fade-in text-gray-900">
      <header className="bg-white px-5 pt-16 pb-6 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div>
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mes Produits</h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Vos investissements</p>
        </div>
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
          <PackageCheck className="w-6 h-6" />
        </div>
      </header>

      <div className="px-5 mt-6 max-w-md mx-auto space-y-4">
        {investments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Aucun produit actif</h3>
            <p className="text-gray-500 text-sm mb-6">Investissez dans un plan pour commencer à générer des revenus.</p>
            <button 
              onClick={() => navigate('/invest')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm"
            >
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
