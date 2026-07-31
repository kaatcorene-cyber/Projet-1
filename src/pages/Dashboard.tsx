import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../lib/utils';
import { 
  Camera, LogOut, Download, PiggyBank, 
  ArrowUpRight, Crown, Phone, ArrowDownLeft, MapPin, 
  Users, Headphones, Wallet, Activity, FileSignature, 
  ChevronRight, Info, ShieldCheck, Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { motion } from 'framer-motion';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
  const getVipLevel = (investments?: any[]) => {
    if (!investments || investments.length === 0) return 'VIP0';
    const maxInvest = Math.max(...investments.map(i => Number(i.amount) || 0));
    if (maxInvest >= 500000) return 'VIP5';
    if (maxInvest >= 200000) return 'VIP4';
    if (maxInvest >= 90000) return 'VIP3';
    if (maxInvest >= 40000) return 'VIP2';
    if (maxInvest >= 5000) return 'VIP1';
    return 'VIP0';
  };

  return () => { document.body.style.overflow = 'unset'; };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 p-6 flex flex-col items-center overflow-hidden">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 mt-2">
           <Info className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-6 tracking-tight">Informations</h2>
        
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              La plateforme la plus fiable pour générer des revenus quotidiens.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Investissez dans nos contrats et récoltez vos gains chaque jour.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">2000 FCFA</span>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Gagnez des commissions en parrainant vos amis sur 3 niveaux.
            </p>
          </div>
        </div>
        <div className="w-full space-y-3">
          
           <a href={getTgLink(groupLink)} target="_blank" rel="noopener noreferrer" onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-2xl py-3.5 font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-orange-500/25">
            <Users className="w-5 h-5" /> Rejoindre le Groupe
          </a>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3.5 font-bold text-sm transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

const generateUserId = (uuid: string | undefined) => {
  if (!uuid) return '000000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString().substring(0, 6).padEnd(6, '0');
};

const getTgLink = (url: string | undefined | null) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('https://t.me/')) {
    const path = url.replace('https://t.me/', '');
    if (path.startsWith('+')) {
      return `tg://join?invite=${path.substring(1)}`;
    }
    return `tg://resolve?domain=${path}`;
  }
  return url;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuthStore();
  const { config, fetchConfig } = useAppStore();
  const { installPWA } = usePWAInstall();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(!user || !config);
  
  
  
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const promises = [];
      if (!user) promises.push(fetchProfile());
      if (!config) promises.push(fetchConfig());
      
      if (promises.length > 0) {
        setIsLoading(true);
        await Promise.all(promises);
      } else {
        fetchProfile();
        fetchConfig();
      }
      
      if (mounted) {
        setIsLoading(false);
        if (!sessionStorage.getItem('welcome_shown')) {
          setShowWelcome(true);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, [fetchProfile, fetchConfig]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
    </div>
  );

  const groupLink = 'https://t.me/+_WVnzoKbc89jMDQ0';
  const supportLink = config?.support_link || groupLink;
  const balance = Number(user?.balance) || 0;
  const bankBalance = Number(user?.bank_balance) || 0;

  const menuItems = [
    { icon: FileSignature, label: 'Contrats Actifs', path: '/products', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: PiggyBank, label: 'Compte Retrait', path: '/bank', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Activity, label: 'Historique', path: '/history', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getVipLevel = (investments?: any[]) => {
    if (!investments || investments.length === 0) return 'VIP0';
    const maxInvest = Math.max(...investments.map(i => Number(i.amount) || 0));
    if (maxInvest >= 500000) return 'VIP5';
    if (maxInvest >= 200000) return 'VIP4';
    if (maxInvest >= 90000) return 'VIP3';
    if (maxInvest >= 40000) return 'VIP2';
    if (maxInvest >= 5000) return 'VIP1';
    return 'VIP0';
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-32 text-slate-900 font-sans">
      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={() => { sessionStorage.setItem('welcome_shown', 'true'); setShowWelcome(false); }} />}
      
      {/* Top Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-b-[40px] shadow-lg overflow-hidden pointer-events-none">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[40px] -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-800/20 rounded-full blur-[30px] -ml-10 -mb-10"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
      </div>
      
      <div className="max-w-md mx-auto pt-6 px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm bg-white flex items-center justify-center text-xl pb-0.5">🍀</div>
             <h1 className="text-white text-2xl font-black tracking-wide">Olam Agri</h1>
           </div>
        </div>
        {/* Profile Card */}
        <div className="bg-white rounded-[28px] p-5 shadow-xl shadow-orange-900/5 mb-6 relative overflow-hidden border border-slate-100">
           <div className="flex items-center gap-5 mb-5">
              <div className="relative shrink-0">
                 <div className="w-20 h-20 bg-orange-50 rounded-full border-[3px] border-white shadow-md flex items-center justify-center overflow-hidden relative z-10">
                     <img src="/avatar_orange.svg" alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 {user?.role === 'vip' && (
                   <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                     <Crown className="w-3.5 h-3.5 text-white" />
                   </div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex flex-wrap items-center gap-2 mb-2">
                   <h2 className="text-xl font-black text-slate-900 truncate">ID : {generateUserId(user?.id)}</h2>
                   <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                     <Crown className="w-3 h-3" />
                     {getVipLevel(user?.investments)}
                   </div>
                 </div>
                 {(() => {
                   const hasRecharged = user?.transactions?.some(t => t.type === 'deposit' && t.status === 'approved');
                   return (
                     <div className="flex flex-col gap-1.5">
                       <div>
                         {hasRecharged ? (
                           <div className="inline-flex items-center justify-center bg-green-50 text-green-600 border border-green-200/60 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                             Actif
                           </div>
                         ) : (
                           <div className="inline-flex items-center justify-center bg-slate-100 text-slate-500 border border-slate-200/60 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                             Inactif
                           </div>
                         )}
                       </div>
                       {user?.created_at && (
                         <div className="text-[10px] text-slate-400 font-medium">
                           Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à {new Date(user.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                         </div>
                       )}
                     </div>
                   );
                 })()}
              </div>
           </div>
           
           <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                 <Phone className="w-4 h-4 text-orange-500" /> {user?.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-orange-500" /> {user?.country || 'Non spécifié'}
              </div>
           </div>
        </div>

        {/* Balance Card */}
        <div className="bg-slate-900 rounded-[28px] p-6 shadow-xl shadow-slate-900/10 mb-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Wallet className="w-32 h-32" />
           </div>
           
           <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-end mb-2">
                 <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Solde Principal</p>
                    <h2 className="text-4xl font-black tracking-tight flex items-baseline gap-1.5">
                      {new Intl.NumberFormat('fr-FR').format(balance)}
                      <span className="text-xl font-bold text-slate-300">FCFA</span>
                    </h2>
                 </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                 <Link to="/deposit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                   <ArrowDownLeft className="w-5 h-5" />
                   <span className="font-bold text-sm">Déposer</span>
                 </Link>
                 <Link to="/withdraw" className="flex-1 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                   <ArrowUpRight className="w-5 h-5 text-orange-600" />
                   <span className="font-bold text-sm">Retirer</span>
                 </Link>
              </div>
           </div>
        </div>

        {/* Announcements Banner */}
        <div className="bg-orange-100/50 rounded-2xl p-3 flex items-center gap-3 mb-6 border border-orange-200/50 shadow-sm overflow-hidden relative">
           <Bell className="w-5 h-5 text-orange-600 shrink-0 animate-pulse" />
           <div className="flex-1 overflow-hidden relative h-5">
              <motion.div 
                className="absolute whitespace-nowrap text-xs font-bold text-orange-900"
                animate={{ x: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              >
                Bienvenue sur notre plateforme. Invitez vos amis et gagnez des bonus exclusifs ! 🎉
              </motion.div>
           </div>
        </div>

        {/* Unified Menu List */}
        <div className="flex flex-col gap-2">
           <Link to="/products" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <FileSignature className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Contrats Actifs</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </Link>
           <Link to="/bank" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <PiggyBank className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Compte Retrait</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </Link>
           
           

           <a href={getTgLink(groupLink)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Users className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Groupe Officiel</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </a>
           <button onClick={() => installPWA()} className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50 text-left">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Download className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Installer l'app</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </button>
           
           <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50 text-left mt-2">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <LogOut className="w-6 h-6 text-red-500" />
               </div>
               <span className="font-bold text-red-600 text-[15px]">Déconnexion</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-500 transition-colors" />
           </button>
        </div>
      </div>
    </div>
  );
}
