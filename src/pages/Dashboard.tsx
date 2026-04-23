import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, MessageCircle, HeadphonesIcon, Crown, Loader2, Timer, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function CountdownTimer({ activeInvestments, onTickZero }: { activeInvestments: any[], onTickZero: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

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
        onTickZero(); // Trigger refresh if countdown hits 0
      } else {
        setTimeLeft({
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeInvestments, onTickZero]);

  if (!timeLeft) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
          <Timer className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">Prochain versement dans</p>
          <div className="font-mono text-xl font-bold text-gray-900 tracking-tight">
            {String(timeLeft.h).padStart(2, '0')}:
            {String(timeLeft.m).padStart(2, '0')}:
            {String(timeLeft.s).padStart(2, '0')}
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <Zap className="w-6 h-6 text-yellow-400" />
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
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  
  // Only show loader if we have NO cached data
  const [isLoading, setIsLoading] = useState(!settingsCache || !investmentsCache);

  useEffect(() => {
    refreshUser();
    
    if (!sessionStorage.getItem('whatsappModalShown')) {
      setShowWhatsappModal(true);
      sessionStorage.setItem('whatsappModalShown', 'true');
    }

    // Apply cached data immediately if available
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) {
      applySettings(settingsCache);
    }

    fetchData();
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
      <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
        <Crown className="w-3 h-3" />
        {user.role}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 pt-20 pb-24 min-h-screen">
      {/* WHATSAPP MODAL */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up relative flex flex-col">
            <button 
              onClick={() => setShowWhatsappModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 1L1 13M1 1l12 12"/></svg>
            </button>
            
            <div className="bg-[#25D366] p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md mb-6 relative z-10 shadow-sm border border-white/20">
                <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
              </div>

              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
                <MessageCircle className="w-10 h-10 text-[#25D366] fill-current" />
              </div>
            </div>
            
            <div className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenue 🎉</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Rejoignez notre groupe WhatsApp pour rester informé et ne rien manquer :
              </p>
              
              <a 
                href="https://chat.whatsapp.com/DgxHOEGyN5H07j6rlvOlEf?mode=gi_t" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setShowWhatsappModal(false)}
                className="mt-6 w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                Rejoindre le groupe 👉
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <p className="text-white/80 text-sm">Bonjour,</p>
          <h1 className="text-xl font-bold text-white flex items-center">
            {user?.first_name} {user?.last_name}
            {getVipBadge()}
          </h1>
        </div>
        <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
          <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
        </div>
      </header>

      {/* Balance Card - Always show basic UI immediately */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/40 hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <p className="text-emerald-50 text-sm font-medium mb-1">Solde Total</p>
        <h2 className="text-4xl font-bold tracking-tight mb-6">
          {formatCurrency(user?.balance || 0)}
        </h2>
        
        <div className="flex gap-3">
          <Link to="/deposit" className="flex-1 bg-white text-emerald-600 hover:bg-gray-50 transition-all py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-95 duration-200">
            <ArrowDownRight className="w-5 h-5" />
            Dépôt
          </Link>
          <Link to="/withdraw" className="flex-1 bg-gray-900 text-white hover:bg-black transition-all py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 duration-200">
            <ArrowUpRight className="w-5 h-5" />
            Retrait
          </Link>
        </div>
      </div>

      {activeInvestments.length > 0 && (
        <CountdownTimer 
          activeInvestments={activeInvestments} 
          onTickZero={() => window.location.reload()} 
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            {groupLink ? (
              <a href={groupLink} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-lg hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Groupe Officiel</span>
              </a>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-500">Groupe indisponible</span>
              </div>
            )}

            {supportLink ? (
              <a href={supportLink} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-lg hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HeadphonesIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Service Client</span>
              </a>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <HeadphonesIcon className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-500">Service indisponible</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium mb-1">Gains Journaliers</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(dailyGain)}</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium mb-1">Invest. Actifs</p>
              <p className="text-lg font-bold text-gray-900">{activeInvestments.length}</p>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
