import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Banknote, PlusCircle, Wallet, Activity, Users, Headset, MessageCircle, Crown, Loader2, Briefcase, ChevronRight, X, Building2, PackageCheck, LogOut, Download, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-[60px] pointer-events-none"></div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 z-10 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-zinc-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
         <div className="p-8 text-center mt-2 relative z-10">
            <div className="w-16 h-16 bg-zinc-800 border border-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
               <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            </div>
            
            <h2 className="text-2xl font-black text-zinc-50 mb-3 tracking-tight">Bienvenue !</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
              Pour rester informé de toutes nos actualités et nouveautés, veuillez rejoindre notre communauté officielle.
            </p>
            <div className="space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-red-600 hover:bg-red-500 text-zinc-50 rounded-2xl font-bold tracking-wide shadow-lg shadow-red-500/25 active:scale-95 transition-all text-sm border border-red-500" onClick={onClose}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Rejoindre le Groupe
                </a>
              ) : (
                <button className="flex items-center justify-center w-full py-4 bg-red-600 hover:bg-red-500 text-zinc-50 rounded-2xl font-bold tracking-wide shadow-lg shadow-red-500/25 active:scale-95 transition-all text-sm border border-red-500" onClick={onClose}>
                  Continuer
                </button>
              )}
              <button onClick={onClose} className="w-full py-3.5 text-zinc-500 hover:text-zinc-300 font-bold transition-colors text-sm rounded-xl">
                Plus tard
              </button>
            </div>
         </div>
      </div>
    </div>
  )
}

function SupportModal({ groupLink, supportLink, onClose }: { groupLink: string, supportLink: string, onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-24 right-5 z-[50] flex flex-col gap-4 items-end animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
        <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all bg-zinc-900 pr-2 pl-4 py-2 rounded-full border border-zinc-800 shadow-xl" onClick={onClose}>
          <span className="text-sm font-bold text-zinc-200">Service client</span>
          <div className="bg-red-600 p-3 rounded-full text-zinc-50">
            <Headset className="w-5 h-5" />
          </div>
        </a>
        {groupLink && (
          <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all bg-zinc-900 pr-2 pl-4 py-2 rounded-full border border-zinc-800 shadow-xl" onClick={onClose}>
            <span className="text-sm font-bold text-zinc-200">Groupe officiel</span>
            <div className="bg-blue-600 p-3 rounded-full text-zinc-50">
              <MessageCircle className="w-5 h-5" />
            </div>
          </a>
        )}
      </div>
    </>
  )
}

export function Dashboard() {
  const { user, refreshUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const { settingsCache, setSettingsCache, investmentsCache, setInvestmentsCache } = useAppStore();
  const { isInstallable, installPWA } = usePWAInstall();
  
  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [dailyGain, setDailyGain] = useState(0);
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(!settingsCache || !investmentsCache);

  useEffect(() => {
    refreshUser();
    
    if (!sessionStorage.getItem('welcome_shown')) {
      setShowWelcome(true);
    }

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

    const intervalId = setInterval(() => {
      refreshUser();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) processDailyGains();
      fetchData();
    }, 60000 * 5);

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

    if (groupData?.value) {
      setGroupLink(formatLink(groupData.value, 'https://chat.whatsapp.com/DKDo2qOfJRlF4n0J9tGxNt'));
    } else {
      setGroupLink('https://chat.whatsapp.com/DKDo2qOfJRlF4n0J9tGxNt');
    }
    
    if (supportData?.value) {
      setSupportLink(formatLink(supportData.value, 'https://t.me/qualcomm_agt'));
    } else {
      setSupportLink('https://t.me/qualcomm_agt');
    }
  };

  const isProcessingGains = useRef(false);
  
  const processDailyGains = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || isProcessingGains.current) return;
    isProcessingGains.current = true;
    
    try {
      let hasGlobalChanges = false;
      const now = new Date().getTime();
      
      const { data: invs } = await supabase.from('investments').select('*').eq('user_id', currentUser.id).eq('status', 'active');
      if (!invs) return;
      
      for (const inv of invs) {
        try {
          const start = new Date(inv.start_date || inv.created_at).getTime();
          const lastPaid = new Date(inv.last_paid_at || inv.created_at).getTime();
          
          const totalDaysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
          const lastPaidDaysElapsed = Math.floor((lastPaid - start) / (24 * 60 * 60 * 1000));
          const missingDays = totalDaysElapsed - lastPaidDaysElapsed;
          
          if (missingDays > 0) {
            hasGlobalChanges = true;
            
            let newLastPaidTime = lastPaid + missingDays * 24 * 60 * 60 * 1000;
            if (newLastPaidTime > now) newLastPaidTime = now; 
            
            const newLastPaid = new Date(newLastPaidTime).toISOString();
            const amountToAdd = Number(inv.daily_yield) * missingDays;
            
            await supabase.from('investments').update({ last_paid_at: newLastPaid }).eq('id', inv.id);
            
            await supabase.from('transactions').insert({
              user_id: currentUser.id,
              type: 'daily_gain',
              amount: amountToAdd,
              status: 'completed',
              reference: `Gain du plan (x${missingDays})`
            });
            
            const { data: usr } = await supabase.from('users').select('balance').eq('id', currentUser.id).single();
            if (usr) {
              await supabase.from('users').update({ balance: Number(usr.balance) + amountToAdd }).eq('id', currentUser.id);
            }
          }
          
          if (inv.end_date) {
             const endT = new Date(inv.end_date).getTime();
             const totalExpectedDays = Math.round((endT - start) / (24 * 60 * 60 * 1000));
             
             const currentLastPaid = missingDays > 0 ? lastPaidDaysElapsed + missingDays : lastPaidDaysElapsed;
             
             if (currentLastPaid >= totalExpectedDays) {
                 hasGlobalChanges = true;
                 await supabase.from('investments').update({ status: 'completed' }).eq('id', inv.id);
             }
          }
        } catch (innerErr) {
          console.error("Error with inv:", inv.id, innerErr);
        }
      }
      
      if (hasGlobalChanges) {
        await refreshUser();
        fetchData();
      }
    } catch (err) {
      console.error('Gain process error', err);
    } finally {
      isProcessingGains.current = false;
    }
  };

  const fetchData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      const [invRes, settingsRes] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', currentUser.id).eq('status', 'active'),
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
      <span className="ml-2 inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-500/20">
        <Crown className="w-3 h-3" />
        {user.role}
      </span>
    );
  };

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcome_shown', 'true');
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans text-zinc-100">
      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}
      {showSupportModal && <SupportModal groupLink={groupLink} supportLink={supportLink} onClose={() => setShowSupportModal(false)} />}
      
      <div className="px-5 pt-12 pb-6">
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 p-2 shadow-lg flex items-center justify-center">
                 <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
             </div>
             <div>
               <p className="text-white text-xs font-medium uppercase tracking-wider mb-0.5">Identifiant</p>
               <h1 className="text-lg font-black text-red-500 flex items-center gap-2">
                 F•M-{user?.id?.substring(0, 6).toUpperCase()}
                 {getVipBadge()}
               </h1>
             </div>
          </div>
        </header>

        {/* Emerald Glow Card */}
        <div className="rounded-3xl p-6 relative overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col justify-between" style={{ minHeight: '220px' }}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-red-500" />
                      Solde Total
                    </h2>
                    <div className="text-4xl font-black text-zinc-50 tracking-tight">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link to="/deposit" className="bg-red-600 hover:bg-red-500 text-zinc-50 transition-all py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-red-900/30 active:scale-95 border border-red-500">
                      <PlusCircle className="w-5 h-5" />
                      Recharger
                  </Link>
                  <Link to="/withdraw" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 transition-all py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg active:scale-95 border border-zinc-700">
                      <Banknote className="w-5 h-5" />
                      Retirer
                  </Link>
              </div>
           </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mt-8">
           <Link to="/bank" className="bg-zinc-900 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-400">
                 <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-zinc-400">Comptes</span>
           </Link>
           
           <button onClick={() => setShowSupportModal(true)} className="bg-zinc-900 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-400">
                 <Headset className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-zinc-400">Aide</span>
           </button>
           
           <button onClick={() => installPWA()} className="bg-zinc-900 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-purple-400">
                 <Download className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-zinc-400">App</span>
           </button>
           
           <Link to="/products" className="bg-zinc-900 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-500">
                 <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-zinc-400">Contrat</span>
           </Link>
        </div>

        {/* Large Promos / Buttons */}
        <div className="mt-6 flex flex-col gap-3">
           <button onClick={() => { logout(); navigate('/login'); }} className="w-full relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer">
              <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
              <div className="flex flex-col gap-1 z-10 text-left">
                 <h3 className="text-zinc-50 font-bold text-base flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-red-500" />
                    Se déconnecter
                 </h3>
                 <p className="text-zinc-500 text-xs">Déconnexion de votre espace collaborateur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-400 group-hover:bg-zinc-700 transition-colors z-10">
                 <ChevronRight className="w-5 h-5" />
              </div>
           </button>
        </div>

      </div>
    </div>
  );
}
