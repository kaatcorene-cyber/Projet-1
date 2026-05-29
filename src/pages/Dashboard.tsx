import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Banknote, PlusCircle, Wallet, Activity, Users, Headset, MessageCircle, Crown, Loader2, Pickaxe, ChevronRight, X, Building2, PackageCheck, LogOut, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
         <div className="p-8 text-center mt-2">
            <img src="https://i.imgur.com/bjYgoI6.png" alt="Logo" className="h-8 rounded-full mx-auto mb-6" referrerPolicy="no-referrer" />
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-lg shadow-purple-500/10">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Bienvenue !</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Pour rester informé de toutes nos actualités et nouveautés, veuillez rejoindre notre communauté officielle.
            </p>
            <div className="space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-purple-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm" onClick={onClose}>
                  Rejoindre le Groupe
                </a>
              ) : (
                <button className="block w-full py-4 bg-purple-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm" onClick={onClose}>
                  Continuer
                </button>
              )}
              <button onClick={onClose} className="w-full py-3.5 text-gray-400 hover:text-gray-900 font-bold transition-colors text-sm">
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
      <div className="fixed inset-0 z-[40] bg-black/5 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed bottom-24 right-5 z-[50] flex flex-col gap-5 items-end animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
        <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all" onClick={onClose}>
          <span className="text-base font-bold text-gray-800" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,1)' }}>Service client</span>
          <div className="bg-purple-600 p-4 rounded-full text-white shadow-xl shadow-purple-500/40 transform hover:scale-105 transition-transform">
            <Headset className="w-7 h-7" />
          </div>
        </a>
        {groupLink && (
          <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 active:scale-95 transition-all" onClick={onClose}>
            <span className="text-lg font-black text-gray-900" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,1)' }}>Groupes officiels</span>
            <div className="bg-purple-600 p-4 rounded-full text-white shadow-xl shadow-purple-500/40 transform hover:scale-105 transition-transform">
              <MessageCircle className="w-7 h-7" />
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
  
  // Only show loader if we have NO cached data
  const [isLoading, setIsLoading] = useState(!settingsCache || !investmentsCache);

  useEffect(() => {
    refreshUser();
    
    if (!sessionStorage.getItem('welcome_shown')) {
      setShowWelcome(true);
    }

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

    // Setup polling for real-time like updates (Reduced frequency to save database quota)
    const intervalId = setInterval(() => {
      refreshUser();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) processDailyGains();
      fetchData();
    }, 60000 * 5); // 5 minutes instead of 15 seconds

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
            
            // Calc exact schedule to avoid skipping days
            let newLastPaidTime = lastPaid + missingDays * 24 * 60 * 60 * 1000;
            if (newLastPaidTime > now) newLastPaidTime = now; // Safety fallback
            
            const newLastPaid = new Date(newLastPaidTime).toISOString();
            const amountToAdd = Number(inv.daily_yield) * missingDays;
            
            // 1. Update investment last_paid_at
            await supabase.from('investments').update({ last_paid_at: newLastPaid }).eq('id', inv.id);
            
            // 2. Insert transaction
            await supabase.from('transactions').insert({
              user_id: currentUser.id,
              type: 'daily_gain',
              amount: amountToAdd,
              status: 'completed',
              reference: `Gain du plan (x${missingDays})`
            });
            
            // 3. Directly update user balance loop by loop to prevent race conditions
            const { data: usr } = await supabase.from('users').select('balance').eq('id', currentUser.id).single();
            if (usr) {
              await supabase.from('users').update({ balance: Number(usr.balance) + amountToAdd }).eq('id', currentUser.id);
            }
          }
          
          // Check expiration using expected total days to prevent early completion
          if (inv.end_date) {
             const endT = new Date(inv.end_date).getTime();
             const totalExpectedDays = Math.round((endT - start) / (24 * 60 * 60 * 1000));
             
             // Evaluate completion based on new last paid
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
      <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
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
    <div className="min-h-screen bg-transparent pb-24 font-sans">
      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}
      {showSupportModal && <SupportModal groupLink={groupLink} supportLink={supportLink} onClose={() => setShowSupportModal(false)} />}
      
      {/* Premium Header Region */}
      <div className="bg-white px-5 pt-16 pb-6 shadow-sm border-b border-gray-200">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <img src="https://i.imgur.com/bjYgoI6.png" alt="Logo" className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100" referrerPolicy="no-referrer" />
             <div>
               <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                 🆔 : {user?.phone?.replace(/^\+\d{1,4}\s?/, '')}
                 {getVipBadge()}
               </h1>
             </div>
          </div>
        </header>

        {/* Premium Balance Card */}
        <div 
          className="rounded-[2rem] p-6 relative overflow-hidden shadow-xl shadow-purple-900/40 text-white"
        >
           {/* Background Image of Gold/Diamond Mine */}
           <div 
             className="absolute inset-0 z-0"
             style={{
               backgroundImage: `url('https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
           ></div>
           
           {/* Beautiful Gradient Overlay so text is visible but image pops out */}
           <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-blue-900/40"></div>
           
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none z-0"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none z-0"></div>
           
           <div className="relative z-10 flex justify-between items-start mb-8">
               <div>
                  <p className="text-purple-100 text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-2 opacity-90">
                    <Wallet className="w-4 h-4 text-white" />
                    Capital Total
                  </p>
                  <h2 className="text-4xl font-black tracking-tighter drop-shadow-md text-white shadow-black/50">
                    {formatCurrency(Number(user?.balance) || 0)}
                  </h2>
               </div>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-3">
               <Link to="/deposit" className="bg-white/40 hover:bg-white/50 backdrop-blur-md text-white transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md border border-white/50 active:scale-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                   <PlusCircle className="w-5 h-5 drop-shadow-sm" />
                   Recharger
               </Link>
               <Link to="/withdraw" className="bg-white/40 hover:bg-white/50 backdrop-blur-md text-white transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md border border-white/50 active:scale-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                   <Banknote className="w-5 h-5 drop-shadow-sm" />
                   Retirer
               </Link>
           </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6 animate-fade-in">
          
          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-3">
             <Link to="/bank" className="bg-white py-4 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-[13px] font-bold text-gray-900">Banque</span>
             </Link>

             <button onClick={() => setShowSupportModal(true)} className="bg-white py-4 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                 <Headset className="w-5 h-5 text-purple-600" />
                 <span className="text-[13px] font-bold text-gray-900">Support</span>
             </button>
             
             <Link to="/products" className="col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-purple-500/30 hover:shadow-lg transition-all active:scale-95">
                 <Pickaxe className="w-6 h-6 text-yellow-300 drop-shadow-md" />
                 <span className="text-sm font-black text-white uppercase tracking-wider">Minage</span>
             </Link>
             
             <button onClick={() => installPWA()} className="bg-white py-4 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                 <Download className="w-5 h-5 text-blue-600" />
                 <span className="text-[13px] font-bold text-gray-900">Application</span>
             </button>

             <button onClick={() => { logout(); navigate('/login'); }} className="bg-white py-4 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-red-600">
                 <LogOut className="w-5 h-5" />
                 <span className="text-[13px] font-bold">Déconnexion</span>
             </button>
          </div>


        </div>
    </div>
  );
}

