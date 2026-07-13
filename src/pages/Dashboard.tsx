import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../lib/utils';
import { 
  Camera,
  LogOut, 
  Download, 
  PiggyBank, 
  ArrowUpRight, 
  ShieldCheck, 
  Crown, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Wallet,
  ArrowDownLeft,
  Users,
  Briefcase,
  Headphones
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { motion } from 'framer-motion';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="w-full max-w-[380px] bg-white border border-slate-100 rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in-95 p-8 flex flex-col items-center overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

        <h2 className="text-2xl font-black text-slate-900 text-center mb-6 tracking-tight mt-2">Informations</h2>
        
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              La plateforme d'investissement la plus fiable pour générer des revenus quotidiens.
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Investissez dans vos contrats et percevez des revenus chaque jour.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">2000 FCFA</span>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Dépôts et retraits 24 h/24 et 7 j/7.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-snug">
              Gagnez des commissions en parrainant vos amis sur 3 niveaux.
            </p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <a href={groupLink} target="_blank" rel="noopener noreferrer" onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl py-3.5 font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25">
            <Users className="w-5 h-5" /> Rejoindre le Groupe
          </a>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-3.5 font-bold text-sm transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuthStore();
  const { config, fetchConfig } = useAppStore();
  const { installPWA } = usePWAInstall();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>(
    localStorage.getItem(`avatar_${user?.id}`) || 'https://i.imgur.com/20bDoyM.png'
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        if (user?.id) {
          localStorage.setItem(`avatar_${user.id}`, base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchConfig()]);
      setIsLoading(false);
      
      if (!sessionStorage.getItem('welcome_shown')) {
        setShowWelcome(true);
      }
    };
    init();
  }, [fetchProfile, fetchConfig]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  const groupLink = config?.telegram_group_url || '#';
  const supportLink = config?.customer_service_url || config?.telegram_group_url || '#';
  const balance = Number(user?.balance) || 0;
  const bankBalance = Number(user?.bank_balance) || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900 font-sans selection:bg-blue-600/30">
      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={() => { sessionStorage.setItem('welcome_shown', 'true'); setShowWelcome(false); }} />}
      
      {/* Curved background header */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-slate-900 rounded-b-[40px] shadow-lg overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-blue-700/20 blur-[80px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] rounded-full bg-cyan-600/20 blur-[60px]"></div>
      </div>

      <div className="px-5 pt-8 pb-6 relative z-10 max-w-lg mx-auto">
        <h1 className="text-center text-white/80 text-sm font-bold uppercase tracking-widest mb-6">Mon Profil</h1>
        
        {/* Header / Profile Info */}
        <header className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
             <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-xl shadow-black/20 relative">
                 <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full bg-slate-50" />
                 
                 {/* Camera Button */}
                 <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center border-[3px] border-slate-900 shadow-md cursor-pointer hover:bg-blue-700 transition-colors z-10">
                   <Camera className="w-4 h-4" />
                   <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 </label>
             </div>
             
             {user?.role === 'vip' && (
               <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md z-10">
                 <Crown className="w-4 h-4 text-white" />
               </div>
             )}
          </div>
          <h1 className="text-2xl text-white font-black tracking-tight">
            {user?.first_name || 'Utilisateur'}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-slate-300 text-sm font-medium">
             <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user?.phone}</span>
             <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
             <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.country}</span>
          </div>
        </header>

        {/* Main Balance Card */}
        <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 relative overflow-hidden"
        >
           {/* Balances */}
           <div className="flex justify-between items-end mb-8">
              <div>
                 <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1.5">Solde Principal</p>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                   {formatCurrency(balance)}
                 </h2>
              </div>
              <div className="text-right">
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total retiré</p>
                 <h3 className="text-lg font-bold text-slate-700">
                   {formatCurrency(bankBalance)}
                 </h3>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="flex gap-3">
              <Link to="/deposit" className="flex-1 bg-gradient-to-br from-blue-700 to-cyan-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-[0.98] border border-blue-600/30">
                <ArrowDownLeft className="w-5 h-5 text-emerald-300" />
                <span className="font-bold text-sm">Dépôt</span>
              </Link>
              <Link to="/withdraw" className="flex-1 bg-gradient-to-br from-blue-700 to-cyan-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-[0.98] border border-blue-600/30">
                <ArrowUpRight className="w-5 h-5 text-blue-200" />
                <span className="font-bold text-sm">Retrait</span>
              </Link>
           </div>
        </motion.div>

        {/* Menu Grid */}
        <div className="bg-white rounded-[32px] p-3 shadow-lg shadow-slate-200/40 border border-slate-100 mb-8">
           <Link to="/products" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Briefcase className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <p className="font-bold text-slate-900">Mes Contrats Actifs</p>
               <p className="text-xs text-slate-500 font-medium">Gérer vos investissements en cours</p>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </Link>

           <Link to="/bank" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
             <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <PiggyBank className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <p className="font-bold text-slate-900">Compte de Retrait</p>
               <p className="text-xs text-slate-500 font-medium">Épargner ou retirer du compte</p>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </Link>

           <div className="grid grid-cols-2 gap-3">
             <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
               <Headphones className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
               <span className="font-bold text-slate-900 text-xs">Support Client</span>
             </a>
             <a href={groupLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
               <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
               <span className="font-bold text-slate-900 text-xs">Groupe Officiel</span>
             </a>
           </div>

           <button onClick={() => installPWA()} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group text-left">
             <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Download className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <p className="font-bold text-slate-900">Installer l'application</p>
               <p className="text-xs text-slate-500 font-medium">Pour un accès plus rapide</p>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>

           <div className="h-px bg-slate-100 mx-4 my-2"></div>

           <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors group text-left">
             <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
               <LogOut className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <p className="font-bold text-red-600">Déconnexion</p>
             </div>
           </button>
        </div>

      </div>
    </div>
  );
}
