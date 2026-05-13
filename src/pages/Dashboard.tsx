import { useEffect, useState } from 'react';
import { ShieldCheck, LogOut, Download, Upload, Server, Headphones, X, Users, History, Landmark, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { usePWAInstall } from '../hooks/usePWAInstall';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-panel border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 text-neutral-400 rounded-full hover:bg-white/10 hover:text-white transition-colors border border-white/10">
          <X className="w-4 h-4" />
        </button>
         <div className="p-8 text-center mt-4">
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo" className="w-8 h-8 rounded shrink-0 object-contain" />
              <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SIM<span className="text-brand">.COM</span></span>
            </div>
            
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-5 border border-brand/20 shadow-[0_0_30px_rgba(229,9,47,0.1)]">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Rejoignez le Réseau !</h2>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed font-medium">
              Pour rester informé de toutes nos actualités et nouveautés, veuillez rejoindre notre communauté officielle.
            </p>
            <div className="space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-brand hover:bg-[#c40828] text-white rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(229,9,47,0.3)] active:scale-95 transition-all text-sm" onClick={onClose}>
                  Connecter au Groupe
                </a>
              ) : (
                <button className="block w-full py-4 bg-brand hover:bg-[#c40828] text-white rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(229,9,47,0.3)] active:scale-95 transition-all text-sm" onClick={onClose}>
                  Continuer
                </button>
              )}
              <button onClick={onClose} className="w-full py-3.5 text-neutral-500 hover:text-white font-bold transition-colors text-sm">
                 Ignorer pour l'instant
              </button>
            </div>
         </div>
      </motion.div>
    </motion.div>
  )
}


export function Dashboard() {
  const { user, logout } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  const navigate = useNavigate();
  const { isInstallable, installPWA } = usePWAInstall();
  const [totalInvested, setTotalInvested] = useState(0);
  const [dailyYields, setDailyYields] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [groupLink, setGroupLink] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('welcome_shown')) {
      setShowWelcome(true);
    }
    
    if (settingsCache) {
       const link = settingsCache.find(s => s.key === 'group_link')?.value;
       if (link) setGroupLink(link);
    } else {
       supabase.from('settings').select('*').then(({ data }) => {
          if (data) {
             setSettingsCache(data);
             const link = data.find(s => s.key === 'group_link')?.value;
             if (link) setGroupLink(link);
          }
       });
    }
  }, []);

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcome_shown', 'true');
    setShowWelcome(false);
  };

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const { data: investments } = await supabase
        .from('investments')
        .select('amount, daily_yield')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      let totInv = 0;
      let dYields = 0;
      if (investments) {
        investments.forEach(inv => {
          totInv += inv.amount;
          dYields += inv.daily_yield;
        });
      }
      setTotalInvested(totInv);
      setDailyYields(dYields);
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] font-sans text-neutral-900 pb-24 overflow-x-hidden relative bg-white">
      
      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}

      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 px-5 pt-12 pb-4 bg-white/80 backdrop-blur-xl border-b border-neutral-200 rounded-none rounded-b-3xl mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 overflow-hidden shadow-sm"
            >
               <img src="https://i.imgur.com/HfAOyni.jpeg" alt="SIM" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            >
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-none mb-1">Salut, {user.first_name} ✨</h1>
              <p className="text-neutral-500 font-medium text-xs tracking-wide">Bienvenue sur SIMCom</p>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
                title="Admin"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout} 
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-brand transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 relative z-10 space-y-6">
        
        {/* Premium Balance Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-brand rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgba(229,9,47,0.3)] border border-brand/80 text-white"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
           <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-white/80">
                   <ShieldCheck className="w-5 h-5 text-white" />
                   <span className="text-[10px] uppercase tracking-widest font-black">Capital Total</span>
                 </div>
                 <span className="text-[9px] font-bold text-white bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest border border-white/10">Sécurisé</span>
               </div>
               
               <h2 className="text-4xl font-black tracking-tight text-white mb-8 flex items-baseline gap-1 drop-shadow-sm">
                 {formatCurrency(user.balance || 0).replace('FCFA', '').trim()} <span className="text-sm font-black text-white/80">FCFA</span>
               </h2>
               
               <div className="flex gap-4 p-4 bg-black/10 rounded-2xl border border-white/10 shadow-inner">
                 <div className="flex-1">
                    <p className="text-white/70 font-bold text-[9px] uppercase tracking-widest mb-1">Gains Journaliers</p>
                    <p className="text-white font-black tracking-tight flex items-baseline gap-1">
                      +{formatCurrency(dailyYields).replace('FCFA', '').trim()} <span className="text-[10px] text-white/70">FCFA</span>
                    </p>
                 </div>
                 <div className="w-px bg-white/20"></div>
                 <div className="flex-1 pl-4">
                    <p className="text-white/70 font-bold text-[9px] uppercase tracking-widest mb-1">Investissements</p>
                    <p className="text-white font-black tracking-tight flex items-baseline gap-1">
                      {formatCurrency(totalInvested).replace('FCFA', '').trim()} <span className="text-[10px] text-white/70">FCFA</span>
                    </p>
                 </div>
               </div>
           </div>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           {[
             { to: '/deposit', icon: Download, label: 'Dépôt', delay: 0.1 },
             { to: '/withdraw', icon: Upload, label: 'Retrait', delay: 0.15 },
             { to: '/history', icon: History, label: 'Historique', delay: 0.2 },
             { to: '/devices', icon: Server, label: 'Appareils', delay: 0.25 },
             { to: '/bank', icon: Landmark, label: 'Banque', delay: 0.28 },
             { to: '/support', icon: Headphones, label: 'Support', delay: 0.3 }
           ].map((item, idx) => (
               <Link key={idx} to={item.to}>
                 <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: item.delay }}
                   whileHover={{ y: -2, scale: 1.02 }}
                   whileTap={{ scale: 0.95 }}
                   className="flex flex-col items-center gap-2 group p-2"
                 >
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100 text-brand shadow-sm transition-all duration-300 group-hover:bg-brand group-hover:text-white group-hover:shadow-[0_4px_14px_0_rgba(229,9,47,0.3)]">
                      <item.icon className="w-6 h-6 transition-colors" />
                   </div>
                   <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest transition-colors group-hover:text-brand">{item.label}</span>
                 </motion.div>
               </Link>
           ))}
        </div>
      </div>
    </div>
  );
}
