import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, 
  LogOut, ChevronRight, Download, Landmark,
  User as UserIcon, Phone, MapPin, ShieldCheck,
  Bell, Gift, Users, Apple, Share, PlusSquare, X
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
    <div className="min-h-screen bg-slate-50 p-4 pt-10 pb-32 font-sans text-slate-900 relative">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Mon Profil</h1>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Informations du compte</p>
      </header>

      <div className="max-w-md mx-auto relative z-10 space-y-6">
        
        {/* Announcements Banner */}
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-slate-200 shadow-sm overflow-hidden relative">
           <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
             <Bell className="w-4 h-4 animate-pulse" />
           </div>
           <div className="flex-1 overflow-hidden relative h-5" style={{ containerType: 'inline-size' }}>
              <motion.div 
                 className="absolute whitespace-nowrap text-xs font-semibold text-slate-600"
                animate={{ x: ["100cqw", "-100%"] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              >
                🤗 Bienvenue, cher membre sur ElevFinAi ! ElevFinAi est une plateforme dédiée au secteur de l’élevage en Côte d’Ivoire 🇨🇮, visant à valoriser et soutenir les activités d’élevage à travers des solutions modernes et accessibles. Merci pour votre confiance et bienvenue dans l’aventure ! 🐄 🐐 🐑 🐖 🐔
              </motion.div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-3 flex justify-center items-center border border-slate-200 shadow-sm">
           <span className="font-black text-slate-800 text-base tracking-wide">🆔 : <span className="text-emerald-600">{user?.phone}</span></span>
        </div>

        {/* Balance Card */}
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-32 h-32" />
           </div>
           
           <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           
           <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-end mb-2">
                 <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1.5">Solde Principal</p>
                    <h2 className="text-4xl font-black tracking-tight flex items-baseline gap-1.5">
                      {new Intl.NumberFormat('fr-FR').format(balance)}
                      <span className="text-xl font-bold text-emerald-100">FCFA</span>
                    </h2>
                 </div>
              </div>
              
              <div className="flex gap-3 mt-2">
                 <Link to="/deposit" className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl py-3 flex items-center justify-center gap-2 transition-colors active:scale-95 font-bold text-sm shadow-sm">
                   <ArrowDownLeft className="w-5 h-5" />
                   Déposer
                 </Link>
                 <Link to="/withdraw" className="flex-1 bg-emerald-600/50 hover:bg-emerald-600 text-white border border-emerald-400/30 rounded-2xl py-3 flex items-center justify-center gap-2 transition-colors active:scale-95 font-bold text-sm">
                   <ArrowUpRight className="w-5 h-5" />
                   Retirer
                 </Link>
              </div>
           </div>
        </div>

        {/* Unified Menu List */}
        <div className="space-y-3">
           <Link to="/bank" className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 shrink-0">
               <Landmark className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Lier un compte de retrait</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
           </Link>
           
                      <a href="https://t.me/+w9yTyaXn7AxjMzc0" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0">
               <Users className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Groupe officiel</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
           </a>
           
           <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center p-4 bg-white hover:bg-red-50 rounded-2xl transition-colors group shadow-sm border border-slate-200 text-left">
             <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mr-4 shrink-0">
               <LogOut className="w-5 h-5" />
             </div>
             <span className="font-bold text-red-600 flex-1 text-sm">Déconnexion</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
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
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Appuyez sur Partager</p>
                    <p className="text-slate-500 text-sm">Appuyez sur l'icône <Share className="w-4 h-4 inline-block mx-1" /> dans la barre de navigation Safari en bas de votre écran.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Ajouter à l'écran d'accueil</p>
                    <p className="text-slate-500 text-sm">Faites défiler le menu et sélectionnez l'option <strong>"Sur l'écran d'accueil"</strong> <PlusSquare className="w-4 h-4 inline-block mx-1" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">3</div>
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
