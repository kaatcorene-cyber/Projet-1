import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseSafeDate } from '../lib/utils';
import { Banknote, PlusCircle, Users, Headset, LogOut, Sprout, Wallet, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';

function CountdownTimer({ activeInvestments }: { activeInvestments: any[] }) {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);

  useEffect(() => {
    if (!activeInvestments.length) return;

    const calculateTime = () => {
      let closestPayout = Infinity;
      const now = Date.now();

      activeInvestments.forEach(inv => {
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
    <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-black/5 shadow-sm mt-6">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent pointer-events-none"></div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Prochain gain de culture</span>
        </div>
        <div className="font-mono text-3xl font-black text-gray-900 tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-emerald-500/50 mx-1 mb-1">:</span>
          <span>{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-emerald-500/50 mx-1 mb-1">:</span>
          <span className="text-emerald-600">{String(timeLeft.s).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
          <circle 
            className="text-gray-100" 
            strokeWidth="6" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="40" 
            cy="40" 
          />
          <circle 
            className="text-emerald-500 transition-all duration-1000 ease-linear" 
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
          <Sprout className="w-6 h-6 text-emerald-600 animate-pulse" />
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
    if (settingsCache && investmentsCache) setIsLoading(false);
    
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

  const handleLogout = async () => {
    supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <p className="absolute mt-16 text-emerald-600 font-bold animate-pulse text-xs">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent translate-y-1/3 -translate-x-1/3"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
      </div>
      
      <div className="relative z-10 px-5 pt-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Espace Utilisateur</p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
              Compte
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
               Bienvenue, {user?.first_name || 'Utilisateur'}
            </p>
          </div>
          <AppLogo imgClassName="h-8 w-auto object-contain max-h-10" />
        </header>

        {/* Main Balance Card */}
        <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm relative overflow-hidden mb-5">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
           <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="flex justify-between items-start mb-5 relative z-10">
               <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    Solde du Compte
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </h2>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-500">
                      <span>N° Compte :</span>
                      <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md font-bold border border-black/5">+225 {user.phone}</span>
                    </div>
                  )}
               </div>
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-500/20 rounded-full text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Actif</span>
               </div>
           </div>

           {/* Actions Financer / Retirer */}
           <div className="grid grid-cols-2 gap-3.5 mt-5 relative z-10">
               <Link 
                 to="/deposit" 
                 className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white transition-all py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md shadow-emerald-600/25 active:scale-95 min-h-[50px]"
               >
                   <PlusCircle className="w-5 h-5 shrink-0" />
                   <span className="tracking-wide">Financer</span>
               </Link>
               <Link 
                 to="/withdraw" 
                 className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white transition-all py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md shadow-slate-900/20 active:scale-95 min-h-[50px]"
               >
                   <Banknote className="w-5 h-5 shrink-0 text-emerald-400" />
                   <span className="tracking-wide">Retirer</span>
               </Link>
           </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-5">
           <div className="bg-white rounded-2xl p-4 border border-black/5 relative overflow-hidden shadow-sm">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Rendement / jour</p>
              <p className="text-lg font-black text-emerald-600">{formatCurrency(dailyGain)}</p>
           </div>
           
           <div className="bg-white rounded-2xl p-4 border border-black/5 relative overflow-hidden shadow-sm">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Cultures Actives</p>
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-lg font-black text-gray-900">{activeInvestments.length} <span className="text-xs text-gray-500 font-bold">parcelles</span></p>
              </div>
           </div>
        </div>

        {/* Quick Communications & Logout */}
        <div className="grid grid-cols-2 gap-3">
            {groupLink && (
              <a href={groupLink} target="_blank" rel="noopener noreferrer" className="bg-white border border-black/5 p-3.5 rounded-2xl flex items-center gap-2.5 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                     <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-gray-900 text-xs font-bold">Réseau</span>
                     <span className="text-gray-400 text-[10px] font-semibold">Communauté</span>
                  </div>
              </a>
            )}
            <Link to="/support" className="bg-white border border-black/5 p-3.5 rounded-2xl flex items-center gap-2.5 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                   <Headset className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                   <span className="text-gray-900 text-xs font-bold">Support</span>
                   <span className="text-gray-400 text-[10px] font-semibold">Assistance 24/7</span>
                </div>
            </Link>
        </div>

        <div className="mt-3">
           <button onClick={handleLogout} className="w-full bg-white border border-red-500/15 p-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95 shadow-sm">
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-red-600 text-xs font-bold">Se déconnecter</span>
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
