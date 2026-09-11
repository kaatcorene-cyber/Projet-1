import { useEffect, useState } from 'react';
import { ArrowRight, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { AppLogo } from '../components/AppLogo';

function WelcomeModal({ groupLink, onClose }: { groupLink: string, onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-black/10">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/5 text-gray-600 rounded-full hover:bg-black/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
         <div className="p-8 text-center mt-4">
            <div className="flex items-center justify-center mb-6">
              <AppLogo imgClassName="h-10 w-auto object-contain max-h-12" />
            </div>
            
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Rejoignez la Communauté !</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Pour rester informé de toutes nos actualités et opportunités de culture agricole, rejoignez notre communauté officielle.
            </p>
            <div className="space-y-3">
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-sm text-center" onClick={onClose}>
                  Connecter au Groupe
                </a>
              ) : (
                <button className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-sm" onClick={onClose}>
                  Continuer
                </button>
              )}
              <button onClick={onClose} className="w-full py-3.5 text-gray-500 hover:text-gray-900 font-bold transition-colors text-sm">
                 Ignorer pour l'instant
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { settingsCache, setSettingsCache } = useAppStore();
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent"></div>
         <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/5 to-transparent"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
      </div>

      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}

      {/* Header Section */}
      <div className="relative pt-6 px-4 z-10 block">
        <div className="w-full flex items-center justify-between mb-4">
           <AppLogo imgClassName="h-9 w-auto object-contain max-h-11" />
           <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[11px] font-bold text-emerald-700">En ligne</span>
           </div>
        </div>
        
        {/* Presentation Section - Directly on page (No giant card) */}
        <div className="relative w-full mt-4 space-y-6">
           <div>
             <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
               Bienvenue sur votre plateforme <span className="text-emerald-600">Agricole</span> 🌱
             </h1>
             <p className="text-gray-500 text-xs mt-1 font-semibold uppercase tracking-wider">
               Investissement & Développement des Cultures
             </p>
           </div>
           
           <div className="space-y-4 text-gray-700 text-sm font-medium leading-relaxed">
             <p>
               Une plateforme innovante spécialisée dans le financement et le développement des cultures agricoles à fort rendement. Notre mission est de permettre à chacun de générer des revenus journaliers de manière simple, transparente et accessible, tout en soutenant l'essor de la filière agricole.
             </p>

             <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-500/15">
               <p className="font-bold text-gray-900 mb-3">Grâce à notre système structuré, vous bénéficiez :</p>
               <ul className="space-y-2.5">
                 <li className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span>De gains journaliers attractifs sur 60 jours</span>
                 </li>
                 <li className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span>D’un plan de parrainage avantageux (10% - 3% - 2%)</span>
                 </li>
                 <li className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span>D’une gestion sécurisée, fiable et transparente</span>
                 </li>
               </ul>
             </div>

             <p className="text-gray-700">
               Vous avez l’opportunité de faire fructifier votre argent intelligemment tout en participant activement à l'économie agricole productive.
             </p>

             <div className="mt-4">
               <p className="font-bold text-gray-900 mb-3 text-base">Pourquoi nous rejoindre ?</p>
               <ul className="grid gap-2.5">
                 <li className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-black/5 shadow-sm">
                    <span className="text-emerald-600 font-black">✓</span> <span className="text-gray-900 font-bold text-sm">Sécurité totale des transactions</span>
                 </li>
                 <li className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-black/5 shadow-sm">
                    <span className="text-emerald-600 font-black">✓</span> <span className="text-gray-900 font-bold text-sm">Transparence des rendements</span>
                 </li>
                 <li className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-black/5 shadow-sm">
                    <span className="text-emerald-600 font-black">✓</span> <span className="text-gray-900 font-bold text-sm">Rentabilité stable et garantie</span>
                 </li>
               </ul>
             </div>
             
             <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 mt-6 shadow-sm">
                <p className="text-emerald-700 font-bold mb-2 text-center text-sm">Rejoignez dès aujourd’hui notre communauté agricole et commencez à bâtir vos revenus quotidiens.</p>
                <p className="text-gray-900 font-black tracking-wide text-center text-xs uppercase">Investissez dans la terre, récoltez votre avenir 🌿</p>
             </div>

             <div className="mt-8">
               <h2 className="text-lg font-black text-gray-900 mb-3">🌱 À propos de nos cultures et gains</h2>
               <p className="text-gray-700 font-medium leading-relaxed mb-3">
                 Notre structure génère des rendements à travers l’exploitation et la commercialisation de cultures vivrières et de rente : coton, hévéa, palmier à huile, anacarde, café, manioc, igname, riz et cacao.
               </p>
               <p className="text-gray-700 font-medium leading-relaxed mb-4">
                 Grâce à ces récoltes, des flux constants sont réalisés chaque jour. Une part directe de ces bénéfices est redistribuée chaque jour aux investisseurs.
               </p>
               
               <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
                 <p className="font-bold text-gray-900 mb-3 text-sm">Un modèle pérenne basé sur :</p>
                 <ul className="space-y-2 text-xs font-semibold text-gray-700">
                   <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <span>La valorisation des filières agricoles locales</span>
                   </li>
                   <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <span>La vente de récoltes sur les marchés régionaux et internationaux</span>
                   </li>
                   <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <span>Des partenariats agricoles durables</span>
                   </li>
                 </ul>
               </div>
             </div>

             <div className="mt-6">
               <h2 className="text-lg font-black text-gray-900 mb-2">🚀 BOOSTEZ VOS REVENUS AVEC LE PARRAINAGE</h2>
               <p className="text-gray-700 text-sm font-medium leading-relaxed mb-4">
                 Invitez vos proches et gagnez des commissions automatiques sur leurs investissements :
               </p>

               <div className="grid grid-cols-3 gap-2 mb-4">
                 <div className="bg-white p-3 rounded-xl border border-black/5 text-center shadow-sm">
                   <p className="text-[10px] font-bold text-gray-500 uppercase">Niveau 1</p>
                   <p className="text-xl font-black text-emerald-600">10%</p>
                   <p className="text-[9px] text-gray-500">Directs</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-black/5 text-center shadow-sm">
                   <p className="text-[10px] font-bold text-gray-500 uppercase">Niveau 2</p>
                   <p className="text-xl font-black text-emerald-600">3%</p>
                   <p className="text-[9px] text-gray-500">Secondaires</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-black/5 text-center shadow-sm">
                   <p className="text-[10px] font-bold text-gray-500 uppercase">Niveau 3</p>
                   <p className="text-xl font-black text-emerald-600">2%</p>
                   <p className="text-[9px] text-gray-500">Tertiaires</p>
                 </div>
               </div>
             </div>

             <div className="mt-6">
               <h2 className="text-lg font-black text-gray-900 mb-3">🏆 Garantie & Fiabilité</h2>
               <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm text-xs leading-relaxed text-gray-700">
                 Notre plateforme applique les plus hauts standards de sécurité informatique et financière pour vous offrir un environnement d'investissement transparent, rapide et pérenne.
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-6 pb-8">
        <Link to="/invest" className="w-full relative overflow-hidden group bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 rounded-2xl flex items-center justify-between font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all">
            <div className="flex flex-col text-left">
               <span className="text-base tracking-wide leading-tight mb-0.5">Accéder aux cultures</span>
               <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Découvrir les 9 plans de culture</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
      </div>
    </div>
  );
}
