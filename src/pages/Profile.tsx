import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, 
  LogOut, ChevronRight, Landmark,
  User as UserIcon, ShieldCheck,
  Users, Apple, Share, PlusSquare, X, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { motion, AnimatePresence } from 'framer-motion';

export function Profile() {
  const { user, logout, refreshUser } = useAuthStore();
  const { config, fetchConfig } = useAppStore();
  const { isInstallable, installPWA, isIOS } = usePWAInstall();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState<number>(0);
  const [hasRecharged, setHasRecharged] = useState(false);
  const [showIOSOverlay, setShowIOSOverlay] = useState(false);
  
  useEffect(() => {
    refreshUser();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      const checkRecharge = async () => {
        const { data } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'deposit')
          .eq('status', 'approved')
          .limit(1);
          
        if (data && data.length > 0) {
          setHasRecharged(true);
        }
      };
      
      checkRecharge();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-32">
      {/* Simple Header */}
      <div className="pt-10 pb-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mon Profil</h1>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
           <UserIcon className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* The Unified Premium Wallet Card */}
        <div className="bg-brand-500 rounded-[2rem] p-6 shadow-xl shadow-brand-500/20 relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <UserIcon className="w-4 h-4 text-white" />
                <span className="text-white font-medium tracking-widest font-mono text-xs">{user?.phone}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
                {hasRecharged ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />}
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{hasRecharged ? 'Actif' : 'Nouveau'}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-brand-100 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Solde Total
              </p>
              <h2 className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1.5">
                {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-lg font-bold text-brand-100">FCFA</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/deposit" className="bg-white text-brand-600 hover:bg-brand-50 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-sm active:scale-95">
                <ArrowDownLeft className="w-5 h-5" /> Recharger
              </Link>
              <Link to="/withdraw" className="bg-brand-600/50 hover:bg-brand-600 text-white border border-brand-400/30 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-95">
                <ArrowUpRight className="w-5 h-5" /> Retirer
              </Link>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <Link to="/bank" className="flex items-center p-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700 flex-1 text-sm">Compte de retrait</span>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            <a href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700 flex-1 text-sm">Groupe Communauté</span>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </a>
            
            <Link to="/about" className="flex items-center p-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <Info className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700 flex-1 text-sm">À propos d'ElevFinAi</span>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
            </Link>
          </div>

          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center p-4 bg-white hover:bg-red-50 rounded-3xl transition-colors group shadow-sm border border-slate-100 text-left">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mr-4 shrink-0 transition-transform group-hover:scale-110">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold text-red-600 flex-1 text-sm">Déconnexion</span>
          </button>
        </div>

      </div>

      {/* Full Screen iOS Install Overlay */}
      <AnimatePresence>
        {showIOSOverlay && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 flex flex-col p-6"
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setShowIOSOverlay(false)}
                className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900 mb-6 shadow-sm border border-slate-200 self-center">
                <Apple className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black tracking-tight text-center mb-2">Installation sur iOS</h2>
              <p className="text-slate-500 text-center mb-10 text-sm">Installez l'application sur votre iPhone pour une expérience plus rapide et en plein écran.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Appuyez sur Partager</p>
                    <p className="text-slate-500 text-sm">Appuyez sur l'icône <Share className="w-4 h-4 inline-block mx-1" /> dans la barre de navigation Safari en bas de votre écran.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Ajouter à l'écran d'accueil</p>
                    <p className="text-slate-500 text-sm">Faites défiler le menu et sélectionnez l'option <strong>"Sur l'écran d'accueil"</strong> <PlusSquare className="w-4 h-4 inline-block mx-1" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Confirmer l'ajout</p>
                    <p className="text-slate-500 text-sm">Appuyez sur <strong>Ajouter</strong> en haut à droite de votre écran.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
