import { useEffect, useState } from 'react';
import { Sun, Zap, ArrowRight, BatteryFull, PlusCircle, Banknote, PanelTop, Users, Headset, LogOut, X, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';

function AboutModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#111] rounded-3xl w-full max-w-sm h-[90vh] overflow-y-auto shadow-2xl relative border border-white/10 p-6 overscroll-none">
        <div className="sticky top-0 right-0 w-full flex justify-end z-20 mb-4 mix-blend-difference">
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
             <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <Sun className="w-8 h-8 text-amber-500" />
              <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight">À propos de SOLEIL-POWER</h2>
            
            <div className="space-y-6 text-gray-300 text-sm font-medium leading-relaxed text-left">
              <p>
                <strong className="text-white">SOLEIL-POWER</strong> est une plateforme innovante spécialisée dans l’investissement dans l’énergie solaire. Notre mission est de permettre à chacun de générer des revenus de manière simple, transparente et accessible.
              </p>

              <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                <p className="font-bold text-white mb-3">Grâce à notre système, vous bénéficiez :</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                     <span>de gains journaliers attractifs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                     <span>d’un plan de parrainage avantageux</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                     <span>d’une plateforme sécurisée et fiable</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-4">🔆 À propos de nos gains</h2>
               <p className="text-gray-300 font-medium leading-relaxed mb-4">
                 SOLEIL-POWER génère des revenus à travers l’exploitation de projets d’énergie solaire.
               </p>
              </div>

              <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-4">🚀 BOOSTEZ VOS REVENUS AVEC LE PARRAINAGE</h2>
               <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 mb-6">
                 <p className="font-bold text-white mb-4">🔥 Vos avantages :</p>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">20% sur vos filleuls directs (Niveau 1)</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">2% sur leurs invités (Niveau 2)</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">1% sur le réseau étendu (Niveau 3)</span>
                   </li>
                 </ul>
               </div>
              </div>

              <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-6">📸 Notre Galerie</h2>
               <div className="grid grid-cols-2 gap-3 mb-8">
                 <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
                   <img src="https://i.imgur.com/TPu2aYa.jpeg" alt="Installation 1" className="w-full h-full object-cover" />
                 </div>
                 <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
                   <img src="https://i.imgur.com/13CtIKN.jpeg" alt="Installation 2" className="w-full h-full object-cover" />
                 </div>
               </div>
              </div>

            </div>
            
            <button onClick={onClose} className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black tracking-wide transition-all text-sm border border-white/10">
               Fermer
            </button>
        </div>
      </div>
    </div>
  )
}

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
         <div className="p-8 text-center mt-4">
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <Sun className="w-8 h-8 text-amber-500" />
              <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
            </div>
            
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Rejoignez le Réseau !</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Pour rester informé de toutes nos actualités et nouveautés sur l'énergie solaire, veuillez rejoindre notre communauté officielle.
            </p>
            <div className="space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all text-sm" onClick={onClose}>
                  Connecter au Groupe
                </a>
              ) : (
                <button className="block w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all text-sm" onClick={onClose}>
                  Continuer
                </button>
              )}
              <button onClick={onClose} className="w-full py-3.5 text-gray-500 hover:text-white font-bold transition-colors text-sm">
                 Ignorer pour l'instant
              </button>
            </div>
         </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user, refreshUser, setUser } = useAuthStore();
  const { settingsCache, setSettingsCache, investmentsCache, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();
  
  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [dailyGain, setDailyGain] = useState(0);
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    refreshUser();
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) applySettings(settingsCache);
    
    fetchData();

    if (!sessionStorage.getItem('welcome_shown')) {
      setShowWelcome(true);
    }

    const intervalId = setInterval(() => {
      refreshUser();
      fetchData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const formatLink = (link: string, defaultLink: string) => {
    if (!link) return defaultLink;
    if (link.startsWith('@')) return `https://t.me/${link.substring(1)}`;
    if (!link.startsWith('http')) return `https://${link}`;
    return link;
  };
  
  const applySettings = (data: any[]) => {
    const groupData = data.find(s => s.key === 'group_link');
    const supportData = data.find(s => s.key === 'support_link');
    if (groupData?.value) setGroupLink(formatLink(groupData.value, ''));
    if (supportData?.value) setSupportLink(formatLink(supportData.value, 'https://t.me/sunpower_agt'));
    else setSupportLink('https://t.me/sunpower_agt');
  };

  const fetchData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    try {
      const [invRes, settingsRes] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', currentUser.id).eq('status', 'active'),
        supabase.from('settings').select('*')
      ]);
      if (invRes.data) {
        setActiveInvestments(invRes.data);
        setInvestmentsCache(invRes.data);
        setDailyGain(invRes.data.reduce((acc, curr) => acc + Number(curr.daily_yield), 0));
      }
      if (settingsRes.data) {
        setSettingsCache(settingsRes.data);
        applySettings(settingsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcome_shown', 'true');
    setShowWelcome(false);
  };

  const handleLogout = async () => {
    supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans text-gray-100 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]"></div>
         <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <div className="relative pt-4 px-4 z-10 block">
        <div className="w-full flex items-center justify-between mb-6">
           <div className="flex items-center gap-1.5">
             <Sun className="w-8 h-8 text-amber-500" />
             <span className="font-black text-white text-lg whitespace-nowrap tracking-tighter">SOLEIL<span className="text-amber-500">-POWER</span></span>
           </div>
           <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-400 hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" />
           </button>
        </div>

        {/* User Info Header */}
        <header className="mb-6">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Réseau Soleil-Power</p>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            Bonjour, {user?.first_name || 'Utilisateur'}
          </h1>
        </header>
        
        {/* Main Dashboard Card */}
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden mb-6">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
           
           <div className="flex justify-between items-start mb-6">
               <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BatteryFull className="w-4 h-4 text-amber-500" />
                    Puissance Générée
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black tracking-tighter text-white">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </h2>
                  </div>
               </div>
           </div>

           {/* Energy Actions */}
           <div className="grid grid-cols-2 gap-4 mt-8">
               <Link to="/deposit" className="group relative overflow-hidden bg-amber-500 hover:bg-amber-400 text-black transition-all py-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95">
                   <PlusCircle className="w-6 h-6 mb-1" />
                   Financer
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
               </Link>
               <Link to="/withdraw" className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all py-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-sm active:scale-95">
                   <Banknote className="w-6 h-6 mb-1 text-amber-500" />
                   Retirer
               </Link>
           </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-[#111] rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Zap className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Rendement Journalier</p>
                <p className="text-xl font-black text-white">{formatCurrency(dailyGain)}</p>
              </div>
           </div>
           
           <div className="bg-[#111] rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                 <PanelTop className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Stations Actives</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                   <p className="text-xl font-black text-white">{activeInvestments.length} <span className="text-sm text-gray-500 font-bold">kW</span></p>
                </div>
              </div>
           </div>
        </div>

        {/* Navigation & Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => setShowAbout(true)} className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex flex-row items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400">
                <Info className="w-5 h-5" />
             </div>
             <div className="flex flex-col text-left">
                <span className="text-white text-sm font-bold">À propos</span>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">La plateforme</span>
             </div>
          </button>
          
          <Link to="/invest" className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex flex-row items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
             <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ArrowRight className="w-5 h-5" />
             </div>
             <div className="flex flex-col text-left">
                <span className="text-white text-sm font-bold">Investir</span>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Acheter</span>
             </div>
          </Link>
        </div>

        {/* Quick Communications */}
        <div className="grid grid-cols-2 gap-4">
            {groupLink && (
              <a href={groupLink} target="_blank" rel="noopener noreferrer" className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-500">
                     <Users className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-white text-sm font-bold">Réseau</span>
                     <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Communauté</span>
                  </div>
              </a>
            )}
            <Link to="/support" className="bg-[#161616] border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-[#1f1f1f] transition-all active:scale-95">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
                   <Headset className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-white text-sm font-bold">Support</span>
                   <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Assistance 24/7</span>
                </div>
            </Link>
        </div>

      </div>
    </div>
  );
}

