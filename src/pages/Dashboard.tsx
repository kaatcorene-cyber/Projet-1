import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Banknote, PlusCircle, Wallet, Activity, Users, Headset, MessageCircle, Crown, Loader2, Briefcase, ChevronRight, X, Building2, PackageCheck, LogOut, Download, Layers, PiggyBank } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glossy Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"></div>
      
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-500 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-red-600/20 to-transparent"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md border border-zinc-800/50 text-zinc-400 rounded-full hover:bg-zinc-800 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="pt-12 pb-8 px-6 relative z-10 flex flex-col items-center">
            {/* Visual Icon Header */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-[2rem] blur-xl animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2rem] flex items-center justify-center shadow-inner relative z-10 p-4">
                    <img src="https://i.imgur.com/CDLHO6I.png" alt="App Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" referrerPolicy="no-referrer" />
                </div>
                {/* Decorative Badge */}
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg border border-red-500 z-20">
                  <MessageCircle className="w-5 h-5" />
                </div>
            </div>
            
            <h2 className="text-2xl font-black text-white text-center mb-3 tracking-tight">Bienvenue sur Fuel•Max</h2>
            <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed font-medium">
              Ne manquez aucune nouveauté, intégrez la <span className="text-red-400 font-bold">communauté officielle</span> pour profiter des meilleurs conseils et du support prioritaire.
            </p>
            
            <div className="w-full space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="relative group flex items-center justify-center w-full py-4 rounded-2xl font-bold tracking-wide transition-all overflow-hidden bg-gradient-to-br from-red-600 to-red-700 shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95 border border-red-500/50" onClick={onClose}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                  <span className="relative z-10 flex items-center text-white">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Rejoindre le Groupe Officiel
                  </span>
                </a>
              ) : (
                <button className="relative group flex items-center justify-center w-full py-4 rounded-2xl font-bold tracking-wide transition-all overflow-hidden bg-gradient-to-br from-red-600 to-red-700 shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95 border border-red-500/50" onClick={onClose}>
                  <span className="relative z-10 flex items-center text-white">
                    Continuer
                  </span>
                </button>
              )}
              
              <button onClick={onClose} className="w-full py-3.5 text-zinc-500 hover:text-zinc-300 font-bold transition-colors text-xs uppercase tracking-wider rounded-xl">
                Accéder au tableau de bord
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
        <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 pr-2 pl-4 py-2 rounded-full border border-zinc-800 shadow-xl" onClick={onClose}>
          <span className="text-sm font-bold text-zinc-200">Service client</span>
          <div className="bg-red-600 p-3 rounded-full text-zinc-50">
            <Headset className="w-5 h-5" />
          </div>
        </a>
        {groupLink && (
          <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 pr-2 pl-4 py-2 rounded-full border border-zinc-800 shadow-xl" onClick={onClose}>
            <span className="text-sm font-bold text-zinc-200">Groupe officiel</span>
            <div className="bg-orange-600 p-3 rounded-full text-zinc-50">
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
  const [todayGain, setTodayGain] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  const fetchUserData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [todayGainRes, withdrawRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', currentUser.id)
          .eq('type', 'daily_gain')
          .gte('created_at', today.toISOString()),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', currentUser.id)
          .eq('type', 'withdrawal')
          .eq('status', 'approved')
      ]);
      
      if (todayGainRes.data && !todayGainRes.error) {
        const total = todayGainRes.data.reduce((acc, curr) => acc + Number(curr.amount), 0);
        setTodayGain(total);
      }

      if (withdrawRes.data && !withdrawRes.error) {
        const totalW = withdrawRes.data.reduce((acc, curr) => acc + Number(curr.amount), 0);
        setTotalWithdrawn(totalW);
      }
    } catch (err) {
      console.error(err);
    }
  };
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
      setGroupLink(formatLink(groupData.value, 'https://chat.whatsapp.com/FKBDvzPKzCZISPyKvREZBr?s=cl&p=i&ilr=4'));
    } else {
      setGroupLink('https://chat.whatsapp.com/FKBDvzPKzCZISPyKvREZBr?s=cl&p=i&ilr=4');
    }
    
    if (supportData?.value) {
      setSupportLink(formatLink(supportData.value, 'https://wa.me/918954151939'));
    } else {
      setSupportLink('https://wa.me/918954151939');
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
      await fetchUserData();
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
             <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="w-12 h-12 object-cover rounded-2xl shadow-sm shadow-black/20 border border-zinc-800 shrink-0 bg-zinc-900" referrerPolicy="no-referrer" />
             <div>
               <p className="text-white text-xs font-medium uppercase tracking-wider mb-0.5">Identifiant</p>
               <h1 className="text-lg font-black text-red-500 flex items-center gap-2">
                 F•M-{user?.id?.substring(0, 6).toUpperCase()}
                 {getVipBadge()}
               </h1>
             </div>
          </div>
        </header>

        {/* Main Red Glow Card */}
        <div className="rounded-3xl p-6 relative overflow-hidden bg-zinc-900/80 backdrop-blur-xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col justify-between" style={{ minHeight: '220px' }}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-red-500" />
                      Solde Total
                    </h2>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-400 tracking-tight">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </div>
                 </div>
                 <button onClick={() => { logout(); navigate('/login'); }} className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors shadow-lg group">
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 mb-3">
                  <Link to="/deposit" className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-zinc-50 transition-all py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 border border-red-500/50">
                      <PlusCircle className="w-5 h-5" />
                      Recharger
                  </Link>
                  <Link to="/withdraw" className="bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-zinc-50 transition-all py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg active:scale-95 border border-zinc-700">
                      <Banknote className="w-5 h-5" />
                      Retirer
                  </Link>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mt-1 px-1">
                 <span>Total retiré :</span>
                 <span className="text-zinc-200 font-bold">{formatCurrency(totalWithdrawn)}</span>
              </div>
           </div>
        </div>

        {/* Active Dashboard Summary */}
        <div className="mt-8">
           <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-zinc-100 font-bold text-sm tracking-wide">Résumé d'activité</h2>
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-3 shadow-lg flex flex-col items-center text-center justify-center hover:border-red-500/20 transition-all">
                 <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-1 leading-tight">Gain obtenu aujourd'hui</p>
                 <p className="text-sm font-black text-zinc-100 tracking-tight">{formatCurrency(todayGain)}</p>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-3 shadow-lg flex flex-col items-center text-center justify-center hover:border-orange-500/20 transition-all">
                 <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-1 leading-tight">Gain prévu par jour</p>
                 <p className="text-sm font-black text-zinc-100 tracking-tight">{formatCurrency(dailyGain)}</p>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-3 shadow-lg flex flex-col items-center text-center justify-center hover:border-amber-500/20 transition-all">
                 <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-1 leading-tight">Contrats actifs</p>
                 <p className="text-lg font-black text-zinc-100 tracking-tight">{activeInvestments.length}</p>
              </div>
           </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-3 gap-3 mt-8">
           <button onClick={() => installPWA()} className="group bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl hover:border-red-500/30 hover:bg-zinc-800/80 transition-all shadow-lg shadow-black/20">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500/10 transition-all shadow-inner">
                 <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight text-center font-bold text-zinc-400 group-hover:text-zinc-200 px-1">Télécharger l'application</span>
           </button>

           <Link to="/bank" className="group bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl hover:border-red-500/30 hover:bg-zinc-800/80 transition-all shadow-lg shadow-black/20">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all shadow-inner">
                 <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200">Caisse</span>
           </Link>
           
           <button onClick={() => setShowSupportModal(true)} className="group bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl hover:border-red-500/30 hover:bg-zinc-800/80 transition-all shadow-lg shadow-black/20">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500/10 transition-all shadow-inner">
                 <Headset className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight text-center font-bold text-zinc-400 group-hover:text-zinc-200 px-1">Service client / Groupe officiel</span>
           </button>
        </div>

      </div>
    </div>
  );
}
