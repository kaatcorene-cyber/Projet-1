import fs from 'fs';
const code = `import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { LogOut, Settings, Wallet, ArrowDownLeft, ArrowUpRight, Landmark, Info, ChevronRight, X, Share, PlusSquare, Apple, Users, Server, ShieldCheck, Database, HardDrive, Cpu, Terminal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function Profile() {
  const { user, logout } = useAuthStore();
  const { config } = useAppStore();
  const navigate = useNavigate();
  const balance = user?.balance || 0;
  const { isInstallable, installPWA, isIOS } = usePWAInstall();
  const [showIOSOverlay, setShowIOSOverlay] = useState(false);

  return (
    <div className="px-4 pt-10 min-h-[100dvh] bg-slate-900 font-sans relative overflow-hidden text-slate-200">
      
      {/* Background Cyber Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header Profile Section */}
      <div className="relative z-10 flex flex-col items-center mb-8">
         <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-yellow-500/30 p-1 shadow-xl shadow-yellow-500/10 mb-4 relative">
             <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden relative">
                <Terminal className="w-10 h-10 text-yellow-400 absolute opacity-20" />
                <span className="text-3xl font-black text-white relative z-10">{user?.first_name?.charAt(0) || 'U'}</span>
             </div>
             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 border-2 border-yellow-500/50 rounded-xl flex items-center justify-center shadow-lg text-yellow-400">
                <ShieldCheck className="w-4 h-4" />
             </div>
         </div>
         <h1 className="text-2xl font-black text-white tracking-tight">{user?.first_name} {user?.last_name}</h1>
         <div className="bg-slate-800/80 px-3 py-1 rounded-lg border border-white/5 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-300 text-xs tracking-wider">ID: {user?.phone}</span>
         </div>
      </div>

      {/* Main Balance Node */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-6 z-10">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Server className="w-32 h-32 text-yellow-400" />
         </div>
         
         <div className="flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><Database className="w-3.5 h-3.5 text-yellow-500"/> Ressources Actives</p>
                  <h2 className="text-4xl font-black tracking-tight flex items-baseline gap-1.5 text-white">
                    {new Intl.NumberFormat('fr-FR').format(balance)}
                    <span className="text-xl font-bold text-yellow-500">FCFA</span>
                  </h2>
               </div>
            </div>
            
            <div className="flex gap-3 mt-2">
               <Link to="/deposit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-2xl py-3 flex items-center justify-center gap-2 transition-colors active:scale-95 font-black text-sm shadow-lg shadow-yellow-500/20">
                 <ArrowDownLeft className="w-5 h-5" />
                 Alimenter
               </Link>
               <Link to="/withdraw" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-2xl py-3 flex items-center justify-center gap-2 transition-colors active:scale-95 font-bold text-sm">
                 <ArrowUpRight className="w-5 h-5 text-yellow-500" />
                 Extraire
               </Link>
            </div>
         </div>
      </div>

      {/* Unified Menu List */}
      <div className="space-y-3 z-10 relative mb-10">
         <Link to="/bank" className="flex items-center p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl transition-colors group shadow-lg border border-white/5">
           <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mr-4 shrink-0 border border-yellow-500/20">
             <Landmark className="w-5 h-5" />
           </div>
           <span className="font-bold text-white flex-1 text-sm">Compte de Réception</span>
           <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
         </Link>
         
         <a href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl transition-colors group shadow-lg border border-white/5">
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mr-4 shrink-0 border border-blue-500/20">
             <Users className="w-5 h-5" />
           </div>
           <span className="font-bold text-white flex-1 text-sm">Réseau Officiel</span>
           <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
         </a>

         <Link to="/about" className="w-full flex items-center p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl transition-colors group shadow-lg border border-white/5 text-left">
           <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mr-4 shrink-0 border border-purple-500/20">
             <Info className="w-5 h-5" />
           </div>
           <span className="font-bold text-white flex-1 text-sm">Protocole / À propos</span>
           <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
         </Link>

         <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center p-4 bg-slate-800 hover:bg-red-500/10 rounded-2xl transition-colors group shadow-lg border border-white/5 text-left">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mr-4 shrink-0 border border-red-500/20">
             <LogOut className="w-5 h-5" />
           </div>
           <span className="font-bold text-red-400 flex-1 text-sm">Déconnexion Serveur</span>
           <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
         </button>
      </div>

      {/* Full Screen iOS Install Overlay */}
      <AnimatePresence>
        {showIOSOverlay && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col p-6 text-slate-200"
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setShowIOSOverlay(false)}
                className="w-10 h-10 bg-slate-800 rounded-full shadow-sm border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-yellow-400 mb-6 shadow-sm border border-white/10 self-center">
                <Apple className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight text-center mb-2">Installation iOS</h2>
              <p className="text-slate-400 text-center mb-10 text-sm">Déployez l'application sur votre système iOS pour une expérience optimale.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-white font-bold mb-1">Appuyez sur Partager</p>
                    <p className="text-slate-400 text-sm">Appuyez sur l'icône <Share className="w-4 h-4 inline-block mx-1 text-slate-300" /> dans la barre de navigation Safari.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-white font-bold mb-1">Ajouter à l'écran d'accueil</p>
                    <p className="text-slate-400 text-sm">Faites défiler le menu et sélectionnez l'option <strong className="text-slate-200">"Sur l'écran d'accueil"</strong> <PlusSquare className="w-4 h-4 inline-block mx-1 text-slate-300" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="text-white font-bold mb-1">Confirmer</p>
                    <p className="text-slate-400 text-sm">Appuyez sur <strong className="text-slate-200">Ajouter</strong> en haut à droite de votre écran.</p>
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
fs.writeFileSync('src/pages/Profile.tsx', code);
