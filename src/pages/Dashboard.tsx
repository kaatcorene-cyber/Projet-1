import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, MessageCircle, HeadphonesIcon, Crown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <header className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Bonjour,</p>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            {user?.first_name} {user?.last_name}
            {getVipBadge()}
          </h1>
        </div>
        <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
      </header>

      {/* Balance Card - Always show basic UI immediately */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <p className="text-emerald-50 text-sm font-medium mb-1">Solde Total</p>
        <h2 className="text-4xl font-bold tracking-tight mb-6">
          {formatCurrency(user?.balance || 0)}
        </h2>
        
        <div className="flex gap-3">
          <Link to="/deposit" className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium backdrop-blur-sm">
            <ArrowDownRight className="w-4 h-4" />
            Dépôt
          </Link>
          <Link to="/withdraw" className="flex-1 bg-black/10 hover:bg-black/20 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium backdrop-blur-sm">
            <ArrowUpRight className="w-4 h-4" />
            Retrait
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            {groupLink ? (
              <a href={groupLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Rejoindre le groupe</span>
              </a>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50">
                <MessageCircle className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-bold text-gray-500">Groupe indisponible</span>
              </div>
            )}

            {supportLink ? (
              <a href={supportLink} target="_blank" rel="noopener noreferrer" className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors">
                <HeadphonesIcon className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Service Client</span>
              </a>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 opacity-50">
                <HeadphonesIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-bold text-gray-500">Service indisponible</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium mb-1">Gains Journaliers</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(dailyGain)}</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
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
