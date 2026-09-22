import fs from 'fs';

const content = `import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, 
  LogOut, ChevronRight, Landmark,
  User as UserIcon, ShieldCheck,
  Users, Apple, Share, PlusSquare, X, Info, Phone, Download
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
          .eq('status', 'completed')
          .limit(1);
          
        if (data && data.length > 0) {
          setHasRecharged(true);
        }
      };
      checkRecharge();
    }
  }, [user]);

  return (
    <div className="px-5 pt-12 pb-32 min-h-[100dvh] font-sans relative overflow-hidden bg-[#03296c]">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] -z-10 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-lg mx-auto">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Mon Espace</h1>
            <p className="text-blue-200/60 font-medium text-sm mt-1">Gérez votre compte AGROCI</p>
          </div>
          
          {isInstallable && !isIOS && (
            <button 
              onClick={installPWA}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-colors border border-white/10 shadow-lg"
              title="Installer l'application"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          {isIOS && (
            <button 
              onClick={() => setShowIOSOverlay(true)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-colors border border-white/10 shadow-lg"
              title="Installer sur iOS"
            >
              <Apple className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-2xl border border-brand-400/20">
          {/* Internal deco */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            {/* User Info Line */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Phone className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-white font-medium tracking-widest text-sm">{user?.phone}</span>
              </div>
              <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                {hasRecharged ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {hasRecharged ? 'Actif' : 'Nouveau'}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-8">
              <p className="text-brand-100/80 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Solde Total
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-xl sm:text-2xl font-bold text-brand-200">FCFA</span>
              </h2>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/deposit" 
                className="bg-white text-brand-700 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 shadow-lg"
              >
                <ArrowDownLeft className="w-5 h-5" /> Recharger
              </Link>
              <Link 
                to="/withdraw" 
                className="bg-black/20 text-white border border-white/20 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 hover:bg-black/30 backdrop-blur-sm"
              >
                <ArrowUpRight className="w-5 h-5" /> Retirer
              </Link>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          
          <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-lg">
            <Link to="/bank" className="flex items-center p-4 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mr-4 shrink-0 transition-transform group-hover:scale-105">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-white text-base block mb-0.5">Compte de retrait</span>
                <span className="text-blue-200/60 text-xs">Gérez vos informations de paiement</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>

          <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-lg flex flex-col">
            <a 
              href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center p-4 hover:bg-white/5 transition-colors group border-b border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mr-4 shrink-0 transition-transform group-hover:scale-105">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-white text-base block mb-0.5">Communauté</span>
                <span className="text-blue-200/60 text-xs">Rejoignez notre groupe Telegram</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors" />
            </a>
            
            <Link to="/about" className="flex items-center p-4 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mr-4 shrink-0 transition-transform group-hover:scale-105">
                <Info className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-white text-base block mb-0.5">À propos d'AGROCI</span>
                <span className="text-blue-200/60 text-xs">En savoir plus sur la plateforme</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-purple-400 transition-colors" />
            </Link>
          </div>

          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="w-full mt-8 bg-red-500/10 border border-red-500/20 rounded-3xl p-4 flex items-center justify-center gap-3 text-red-500 font-bold hover:bg-red-500/20 transition-colors active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
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
            className="fixed inset-0 z-[120] bg-[#03296c] flex flex-col p-6"
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setShowIOSOverlay(false)}
                className="w-10 h-10 bg-white/10 rounded-full shadow-sm border border-white/20 flex items-center justify-center text-blue-200/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pb-20">
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-xl border border-white/20 self-center">
                <Apple className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-center mb-3 text-white">Installation iOS</h2>
              <p className="text-blue-200/80 text-center mb-10 text-base leading-relaxed">
                Installez l'application AGROCI sur votre iPhone pour une expérience plus rapide et en plein écran.
              </p>
              
              <div className="space-y-6 bg-white/5 p-6 rounded-[32px] border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-white font-bold mb-1 text-base">Appuyez sur Partager</p>
                    <p className="text-blue-200/70 text-sm leading-relaxed">Appuyez sur l'icône <Share className="w-4 h-4 inline-block mx-1" /> dans la barre de navigation Safari en bas de l'écran.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-white font-bold mb-1 text-base">Ajouter à l'écran d'accueil</p>
                    <p className="text-blue-200/70 text-sm leading-relaxed">Faites défiler le menu et sélectionnez l'option <strong>"Sur l'écran d'accueil"</strong> <PlusSquare className="w-4 h-4 inline-block mx-1" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="text-white font-bold mb-1 text-base">Confirmer l'ajout</p>
                    <p className="text-blue-200/70 text-sm leading-relaxed">Appuyez sur <strong>Ajouter</strong> en haut à droite de votre écran.</p>
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
`;
fs.writeFileSync('src/pages/Profile.tsx', content);
