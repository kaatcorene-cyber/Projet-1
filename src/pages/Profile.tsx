import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseSafeDate } from '../lib/utils';
import { Banknote, PlusCircle, Activity, Users, Headset, Zap, X, Sun, BatteryFull, BatteryCharging, PanelTop, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function CountdownTimer({ activeInvestments }: { activeInvestments: any[] }) {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);

  useEffect(() => {
    if (!activeInvestments.length) return;

    const calculateTime = () => {
      let closestPayout = Infinity;
      const now = Date.now();

      activeInvestments.forEach(inv => {
        const startDateRaw = inv.start_date || inv.created_at;
        
        let start = parseSafeDate(startDateRaw);
        
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
        percent: progressPercent
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeInvestments]);

  if (!timeLeft) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft.percent / 100) * circumference;

  return (
    <div className="bg-[#1a1a1a] rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-white/10 shadow-2xl mt-6">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 to-transparent pointer-events-none"></div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BatteryCharging className="w-4 h-4 text-amber-500" />
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cycle d'énergie</span>
        </div>
        <div className="font-mono text-3xl font-black text-white tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-amber-500/50 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-amber-500/50 mx-1 mb-1">:</span>
          <span className="text-amber-500">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-20 h-20 transform -rotate-90 " viewBox="0 0 80 80">
          <circle 
            className="text-white/5" 
            strokeWidth="6" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="40" 
            cy="40" 
          />
          <circle 
            className="text-amber-500 transition-all duration-1000 ease-linear " 
            strokeWidth="6" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="40" 
            cy="40" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, refreshUser, setUser } = useAuthStore();
  const { settingsCache, setSettingsCache, investmentsCache, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();
  
  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [dailyGain, setDailyGain] = useState(0);
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');
  const [isLoading, setIsLoading] = useState(!settingsCache || !investmentsCache);

  useEffect(() => {
    refreshUser();
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) applySettings(settingsCache);
    
    fetchData();

    const intervalId = setInterval(() => {
      refreshUser();
      fetchData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  const formatLink = (link: string, defaultLink: string) => {
    if (!link) return defaultLink;
    if (link.startsWith('@')) return `https://t.me/${link.substring(1)}`;
    if (!link.startsWith('http')) return `https://${link}`;
    return link;
  };
  
  const applySettings = (data: any[]) => {
    const groupData = data.find(s => s.key === 'group_link');
    const supportData = data.find(s => s.key === 'support_link');
    if (groupData?.value) setGroupLink(formatLink(groupData.value, ''));
    if (supportData?.value) setSupportLink(formatLink(supportData.value, 'https://t.me/sunpower_agt'));
    else setSupportLink('https://t.me/sunpower_agt');
  };

  const fetchData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return setIsLoading(false);
    try {
      const [invRes, settingsRes] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', currentUser.id).eq('status', 'active'),
        supabase.from('settings').select('*')
      ]);
      if (invRes.data) {
        setActiveInvestments(invRes.data);
        setInvestmentsCache(invRes.data);
        setDailyGain(invRes.data.reduce((acc, curr) => acc + Number(curr.daily_yield), 0));
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

  // Generate a mock usage percentage for UI purposes
  const batteryLevel = Math.min(100, Math.max(10, (activeInvestments.length * 20) + 30));

  const handleLogout = async () => {
    supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
        <p className="absolute mt-20 text-amber-500 font-bold animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans text-gray-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent translate-y-1/3 -translate-x-1/3"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>
      
      <div className="relative z-10 px-5 pt-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Réseau Soleil-Power</p>
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              Mon Profil
            </h1>
            <p className="text-gray-400 text-sm mt-1">
               Salut, {user?.first_name || 'Utilisateur'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/20">
             <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-500" />
             </div>
          </div>
        </header>

        {/* Main Power Dashboard Card */}
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden mb-6">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
           
           <div className="flex justify-between items-start mb-6">
               <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BatteryFull className="w-4 h-4 text-amber-500" />
                    Puissance Générée
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black tracking-tighter text-white">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </h2>
                  </div>
               </div>
           </div>

           {/* Energy Actions */}
           <div className="grid grid-cols-2 gap-4 mt-8">
               <Link to="/deposit" className="group relative overflow-hidden bg-amber-500 hover:bg-amber-400 text-black transition-all py-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95">
                   <PlusCircle className="w-6 h-6 mb-1" />
                   Financer
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
               </Link>
               <Link to="/withdraw" className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all py-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-sm active:scale-95">
                   <Banknote className="w-6 h-6 mb-1 text-amber-500" />
                   Retirer
               </Link>
           </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-[#111] rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Zap className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Rendement Journalier</p>
                <p className="text-xl font-black text-white">{formatCurrency(dailyGain)}</p>
              </div>
           </div>
           
           <div className="bg-[#111] rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                 <PanelTop className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Stations Actives</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                   <p className="text-xl font-black text-white">{activeInvestments.length} <span className="text-sm text-gray-500 font-bold">kW</span></p>
                </div>
              </div>
           </div>
        </div>

        {/* Quick Communications & Logout */}
        <div className="grid grid-cols-2 gap-4">
            {groupLink && (
              <a href={groupLink} target="_blank" rel="noopener noreferrer" className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-500">
                     <Users className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white text-sm font-bold">Réseau</span>
                     <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Communauté</span>
                  </div>
              </a>
            )}
            <Link to="/support" className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
                   <Headset className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-white text-sm font-bold">Support</span>
                   <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Assistance 24/7</span>
                </div>
            </Link>
        </div>

        <div className="mt-4">
           <button onClick={handleLogout} className="w-full bg-[#161616] border border-red-500/10 p-4 rounded-3xl flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all active:scale-95">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-white text-sm font-bold">Se déconnecter</span>
           </button>
        </div>

        {activeInvestments.length > 0 && (
          <CountdownTimer 
            activeInvestments={activeInvestments} 
          />
        )}
      </div>
    </div>
  );
}


