import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Banknote, PlusCircle, Wallet, Activity, Users, LifeBuoy, Crown, Loader2, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function CountdownTimer({ activeInvestments, onTickZero }: { activeInvestments: any[], onTickZero: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);

  useEffect(() => {
    if (!activeInvestments.length) return;

    const calculateTime = () => {
      let closestPayout = Infinity;
      const now = Date.now();

      activeInvestments.forEach(inv => {
        const start = new Date(inv.start_date || inv.created_at).getTime();
        const daysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        const nextPayout = start + (daysElapsed + 1) * 24 * 60 * 60 * 1000;
        
        if (nextPayout < closestPayout) {
          closestPayout = nextPayout;
        }
      });

      if (closestPayout === Infinity) return;

      const diff = closestPayout - now;
      if (diff <= 0) {
        onTickZero(); 
      } else {
        const totalMs = 24 * 60 * 60 * 1000;
        const progressPercent = ((totalMs - diff) / totalMs) * 100;

        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
          percent: progressPercent
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeInvestments, onTickZero]);

  if (!timeLeft) return null;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft.percent / 100) * circumference;

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden flex items-center gap-5 border border-gray-100">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
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
            className="text-red-500 transition-all duration-1000 ease-linear" 
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
          <Zap className="w-5 h-5 text-red-500" />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Versement via</p>
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
          <span className="text-red-500">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache, investmentsCache, setInvestmentsCache } = useAppStore();
  
  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [dailyGain, setDailyGain] = useState(0);
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');
  
  // Only show loader if we have NO cached data
  const [isLoading, setIsLoading] = useState(!settingsCache || !investmentsCache);

  useEffect(() => {
    refreshUser();

    // Apply cached data immediately if available
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) {
      applySettings(settingsCache);
    }

    if (user) {
      processDailyGains().then(() => fetchData());
    } else {
      fetchData();
    }

    // Setup polling for real-time like updates
    const intervalId = setInterval(() => {
      refreshUser();
      if (user) processDailyGains();
      fetchData();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const formatLink = (link: string, defaultLink: string) => {
    if (!link) return defaultLink;
    if (link.startsWith('@')) return `https://t.me/${link.substring(1)}`;
    if (!link.startsWith('http')) return `https://${link}`;
    return link;
  };
  
  const applySettings = (data: any[]) => {
    const groupData = data.find(s => s.key === 'group_link');
    const supportData = data.find(s => s.key === 'support_link');

    if (groupData?.value) {
      setGroupLink(formatLink(groupData.value, ''));
    }
    if (supportData?.value) {
      setSupportLink(formatLink(supportData.value, 'https://t.me/petrolimex_Agt'));
    } else {
      setSupportLink('https://t.me/petrolimex_Agt');
    }
  };

  
  const processDailyGains = async () => {
    if (!user) return;
    
    let totalGained = 0;
    const now = new Date().getTime();
    
    // Fetch fresh investments from db
    const { data: invs } = await supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
    if (!invs) return;
    
    for (const inv of invs) {
      const start = new Date(inv.start_date || inv.created_at).getTime();
      const lastPaid = new Date(inv.last_paid_at || inv.created_at).getTime();
      
      const totalDaysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
      const lastPaidDaysElapsed = Math.floor((lastPaid - start) / (24 * 60 * 60 * 1000));
      
      const missingDays = totalDaysElapsed - lastPaidDaysElapsed;
      
      if (missingDays > 0) {
        // Calculate new lastPaid
        const newLastPaid = new Date(start + totalDaysElapsed * 24 * 60 * 60 * 1000).toISOString();
        const amountToAdd = inv.daily_yield * missingDays;
        totalGained += amountToAdd;
        
        await supabase.from('investments').update({ last_paid_at: newLastPaid }).eq('id', inv.id);
        
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'daily_gain',
          amount: amountToAdd,
          status: 'completed',
          reference: `Gain ${missingDays} jours (plan)`
        });
        
        // check expiration
        if (inv.end_date) {
           const endT = new Date(inv.end_date).getTime();
           if (now >= endT || totalDaysElapsed >= (new Date(inv.end_date).getTime() - start) / (24 * 60 * 60 * 1000)) {
               await supabase.from('investments').update({ status: 'completed' }).eq('id', inv.id);
           }
        }
      }
    }
    
    if (totalGained > 0) {
      const { data: usr } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (usr) {
        await supabase.from('users').update({ balance: Number(usr.balance) + totalGained }).eq('id', user.id);
        refreshUser();
      }
      fetchData();
    }
  };


  const fetchData = async () => {
    if (!user) return;

    try {
      const [invRes, settingsRes] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('settings').select('*')
      ]);

      if (invRes.data) {
        setActiveInvestments(invRes.data);
        setInvestmentsCache(invRes.data);
        const totalDaily = invRes.data.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
        setDailyGain(totalDaily);
      }

      if (settingsRes.data) {
        setSettingsCache(settingsRes.data);
        applySettings(settingsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVipBadge = () => {
    if (!user?.role || user.role === 'user' || user.role === 'admin') return null;
    return (
      <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
        <Crown className="w-3 h-3" />
        {user.role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Premium Header Region */}
      <div className="bg-white px-5 pt-16 pb-6 shadow-sm border-b border-gray-200">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl shadow-inner border border-red-100">
               {user?.first_name?.[0]?.toUpperCase() || 'U'}
             </div>
             <div>
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Bienvenue retour</p>
               <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                 {user?.first_name}
                 {getVipBadge()}
               </h1>
             </div>
          </div>
          <img src="https://i.imgur.com/awFyFRj.png" alt="QUALCOMM" className="h-5 object-contain opacity-80" referrerPolicy="no-referrer" />
        </header>

        {/* Premium Balance Card */}
        <div className="bg-gray-900 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl shadow-gray-900/20">
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
           
           <div className="relative z-10 flex justify-between items-start mb-8">
               <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-red-500" />
                    Capital Total
                  </p>
                  <h2 className="text-4xl font-black tracking-tighter text-white">
                    {formatCurrency(user?.balance || 0)}
                  </h2>
               </div>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-3">
               <Link to="/deposit" className="bg-white text-gray-900 hover:bg-gray-100 transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95">
                   <PlusCircle className="w-5 h-5 text-red-600" />
                   Recharger
               </Link>
               <Link to="/withdraw" className="bg-red-600 text-white hover:bg-red-700 transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95">
                   <Banknote className="w-5 h-5" />
                   Retirer
               </Link>
           </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      ) : (
        <div className="px-5 mt-6 space-y-6 animate-fade-in">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Gains Journaliers</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(dailyGain)}</p>
             </div>
             
             <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Plans Actifs</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">{activeInvestments.length} plan{activeInvestments.length > 1 ? 's' : ''}</p>
             </div>
          </div>

          {/* Quick Access */}
          <div className="flex gap-3">
              {groupLink && (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white p-3.5 rounded-2xl flex items-center justify-center gap-2 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <Users className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-gray-900">Groupe</span>
                </a>
              )}
              {supportLink && (
                <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white p-3.5 rounded-2xl flex items-center justify-center gap-2 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <LifeBuoy className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-900">Support</span>
                </a>
              )}
          </div>

          {activeInvestments.length > 0 && (
            <CountdownTimer 
              activeInvestments={activeInvestments} 
              onTickZero={() => processDailyGains()} 
            />
          )}
        </div>
      )}
    </div>
  );
}

