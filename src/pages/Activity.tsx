import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseSafeDate } from '../lib/utils';
import { Clock, Sprout, TrendingUp, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';

function ActivityCountdownTimer({ activeInvestments }: { activeInvestments: any[] }) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number; percent: number } | null>(null);

  useEffect(() => {
    if (!activeInvestments.length) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      let closestPayout = Infinity;
      const now = Date.now();

      activeInvestments.forEach((inv) => {
        const startDateRaw = inv.start_date || inv.created_at;
        const start = parseSafeDate(startDateRaw);

        const daysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        const nextPayout = start + (daysElapsed + 1) * 24 * 60 * 60 * 1000;

        if (nextPayout < closestPayout) {
          closestPayout = nextPayout;
        }
      });

      if (closestPayout === Infinity) return;

      const diff = closestPayout - now;
      const totalMs = 24 * 60 * 60 * 1000;
      let progressPercent = ((totalMs - diff) / totalMs) * 100;
      if (progressPercent > 100) progressPercent = 100;
      if (progressPercent < 0) progressPercent = 0;

      setTimeLeft({
        h: Math.floor((Math.max(0, diff) / (1000 * 60 * 60)) % 24),
        m: Math.floor((Math.max(0, diff) / 1000 / 60) % 60),
        s: Math.floor((Math.max(0, diff) / 1000) % 60),
        percent: progressPercent,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeInvestments]);

  if (!activeInvestments.length) {
    return (
      <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-black/5 shadow-sm text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">Compte à rebours inactif</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Le décompte se déclenche automatiquement dès qu&apos;une culture est lancée.
        </p>
      </div>
    );
  }

  if (!timeLeft) return null;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft.percent / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-black/5 shadow-sm">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent pointer-events-none"></div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Prochain gain de culture</span>
        </div>
        <div
          className="font-mono text-3xl font-black text-gray-900 tracking-widest flex items-baseline"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-emerald-500/50 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-emerald-500/50 mx-1 mb-1">:</span>
          <span className="text-emerald-600">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
        <p className="text-[11px] text-gray-400 font-semibold mt-1">Gains versés toutes les 24h sur votre solde</p>
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
          <circle
            className="text-gray-100"
            strokeWidth="7"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="44"
            cy="44"
          />
          <circle
            className="text-emerald-500 transition-all duration-1000 ease-linear"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="44"
            cy="44"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-7 h-7 text-emerald-600 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function Activity() {
  const { user, refreshUser } = useAuthStore();
  const { investmentsCache, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();

  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [dailyGain, setDailyGain] = useState(0);
  const [isLoading, setIsLoading] = useState(!investmentsCache);

  useEffect(() => {
    refreshUser();
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc: number, curr: any) => acc + Number(curr.daily_yield || 0), 0);
      setDailyGain(totalDaily);
      setIsLoading(false);
    }
    fetchData();

    const intervalId = setInterval(() => {
      refreshUser();
      fetchData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  const fetchData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setActiveInvestments(data);
        setInvestmentsCache(data);
        const total = data.reduce((acc: number, curr: any) => acc + Number(curr.daily_yield || 0), 0);
        setDailyGain(total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <p className="absolute mt-16 text-emerald-600 font-bold animate-pulse text-xs">Chargement de votre activité...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-gray-900 relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="relative z-10 px-5 pt-7 max-w-xl mx-auto">
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-xs font-black text-gray-600 hover:text-emerald-700 bg-white border border-black/5 px-3 py-1.5 rounded-full shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Compte</span>
          </button>
          <AppLogo imgClassName="h-7 w-auto object-contain" />
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">Suivi en direct</p>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Activité</h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">
            Culture active et rendement
          </p>
        </div>

        {/* Primary Stats Grid (Rendement / jour & Cultures Actives) */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <div className="bg-white rounded-3xl p-5 border border-black/5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1">
              Rendement / jour
            </p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(dailyGain)}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-black/5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <Sprout className="w-4 h-4" />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1">
              Cultures Actives
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-black text-gray-900 tracking-tight">
                {activeInvestments.length}
              </p>
              <span className="text-xs text-gray-500 font-bold">parcelles</span>
            </div>
          </div>
        </div>

        {/* Compte à rebours tout en bas */}
        <div className="space-y-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide px-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Compte à rebours de versement</span>
          </h2>
          <ActivityCountdownTimer activeInvestments={activeInvestments} />
        </div>
      </div>
    </div>
  );
}
