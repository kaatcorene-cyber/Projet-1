import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Banknote, PlusCircle, Users, LogOut, Wallet, Activity, ChevronRight, ExternalLink, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';

export function Profile() {
  const { user, refreshUser, setUser } = useAuthStore();
  const { settingsCache, setSettingsCache } = useAppStore();
  const navigate = useNavigate();
  
  // Instant display without waiting for DB network request
  const [groupLink, setGroupLink] = useState('https://t.me/+iqqRWMWHSY8wYWE0');
  const [supportLink, setSupportLink] = useState('https://t.me/AgentCargill');

  useEffect(() => {
    refreshUser();
    if (settingsCache) applySettings(settingsCache);
    fetchData();

    const intervalId = setInterval(() => {
      refreshUser();
      fetchData();
    }, 60000);

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
    if (groupData?.value) setGroupLink(formatLink(groupData.value, 'https://t.me/+iqqRWMWHSY8wYWE0'));
    if (supportData?.value) setSupportLink(formatLink(supportData.value, 'https://t.me/AgentCargill'));
  };

  const fetchData = async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    try {
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        setSettingsCache(settingsData);
        applySettings(settingsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const handleSupportRedirect = () => {
    const target = supportLink || 'https://t.me/AgentCargill';
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-gray-900 relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent translate-y-1/3 -translate-x-1/3"></div>
      </div>
      
      <div className="relative z-10 px-5 pt-8 max-w-xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Espace Utilisateur</p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
              Compte
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
               Bienvenue, {user?.first_name || 'Utilisateur'}
            </p>
          </div>
          <AppLogo imgClassName="h-8 w-auto object-contain max-h-10" />
        </header>

        {/* Main Balance Card */}
        <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm relative overflow-hidden mb-6">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
           <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="flex justify-between items-start mb-5 relative z-10">
               <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    Solde du Compte
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                      {formatCurrency(Number(user?.balance) || 0)}
                    </h2>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-500">
                      <span>N° Compte :</span>
                      <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md font-bold border border-black/5">+225 {user.phone}</span>
                    </div>
                  )}
               </div>
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-500/20 rounded-full text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Actif</span>
               </div>
           </div>

           {/* Actions Financer / Retirer */}
           <div className="grid grid-cols-2 gap-3.5 mt-5 relative z-10">
               <Link 
                 to="/deposit" 
                 className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white transition-all py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md shadow-emerald-600/25 active:scale-95 min-h-[50px]"
               >
                   <PlusCircle className="w-5 h-5 shrink-0" />
                   <span className="tracking-wide">Financer</span>
               </Link>
               <Link 
                 to="/withdraw" 
                 className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white transition-all py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm shadow-md shadow-slate-900/20 active:scale-95 min-h-[50px]"
               >
                   <Banknote className="w-5 h-5 shrink-0 text-emerald-400" />
                   <span className="tracking-wide">Retirer</span>
               </Link>
           </div>
        </div>

        {/* Options & Navigation en lignes pleine largeur */}
        <div className="space-y-3">
          {/* Ligne Activité */}
          <Link
            to="/activity"
            className="w-full bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50/80 transition-all active:scale-[0.99] shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-gray-900 text-sm font-black">Activité</span>
                <span className="text-gray-400 text-xs font-semibold">Culture active et rendement</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </Link>

          {/* Onglet Commission (parrainage & pas de progression) */}
          <Link
            to="/commissions"
            className="w-full bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50/80 transition-all active:scale-[0.99] shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-500/20 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-gray-900 text-sm font-black">Commission</span>
                <span className="text-gray-400 text-xs font-semibold">Paliers de parrainage & récompenses</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </Link>

          {/* Ligne Groupe officiel (affiche immédiatement avec le bon lien) */}
          <a
            href={groupLink || 'https://t.me/+iqqRWMWHSY8wYWE0'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50/80 transition-all active:scale-[0.99] shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-gray-900 text-sm font-black">Groupe officiel</span>
                <span className="text-gray-400 text-xs font-semibold">Communauté officielle Cargill</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
          </a>

          {/* Ligne Se déconnecter */}
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-red-500/15 p-4 rounded-2xl flex items-center justify-between hover:bg-red-50/60 transition-all active:scale-[0.99] shadow-sm text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-red-600 text-sm font-black">Se déconnecter</span>
                <span className="text-gray-400 text-xs font-semibold">Fermer votre session en toute sécurité</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300 shrink-0" />
          </button>
        </div>
      </div>

      {/* Bulle flottante du Service Client (avatar d'un conseiller homme portant l'habit avec le logo) */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={handleSupportRedirect}
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-950/25 hover:scale-105 active:scale-95 transition-all cursor-pointer p-0.5"
          title="Contacter le Service Client"
          aria-label="Contacter le Service Client Cargill"
        >
          {/* Avatar avec la personne : homme habillé avec le logo */}
          <div className="w-full h-full rounded-full overflow-hidden relative bg-emerald-100 flex items-center justify-center">
            <img 
              src="/images/customer_support_avatar.jpg" 
              alt="Conseiller Service Client Cargill" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
            />
            {/* Petit badge logo officiel incrusté sous l'habit au bas de l'avatar */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-emerald-500/50">
              <img src="/icon.svg" alt="Cargill" className="w-3.5 h-3.5 object-contain" />
            </div>
          </div>

          {/* Badge point vert en ligne clignotant */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          {/* Tooltip discret au survol */}
          <span className="absolute right-full mr-2.5 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Service Client 24/7
          </span>
        </button>
      </div>
    </div>
  );
}
