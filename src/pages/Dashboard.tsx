import { useEffect, useState } from 'react';
import { Sun, Zap, ArrowRight, ShieldCheck, BatteryCharging, ChevronRight, Activity, Users, X, Factory, HardHat, Award, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

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
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans text-gray-100 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl"></div>
         <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {showWelcome && <WelcomeModal groupLink={groupLink} onClose={handleCloseWelcome} />}

      {/* Header Section */}
      <div className="relative pt-4 px-4 z-10 block">
        <div className="w-full h-[60px] flex items-center justify-center gap-1.5 mb-4">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white text-lg whitespace-nowrap tracking-tighter">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
        
        {/* Presentation Section */}
        <div className="relative w-full rounded-[2.5rem] bg-[#111] overflow-hidden shadow-2xl border border-white/5 p-6 md:p-8 mt-2">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
           
           <h1 className="text-2xl font-black text-white tracking-tight mb-6 leading-tight">
             Bienvenue sur <span className="text-amber-500">SOLEIL-POWER</span> ☀️
           </h1>
           
           <div className="space-y-5 text-gray-300 text-sm font-medium leading-relaxed">
             <p>
               <strong className="text-white">SOLEIL-POWER</strong> est une plateforme innovante spécialisée dans l’investissement dans l’énergie solaire, un secteur d’avenir en pleine croissance. Notre mission est de permettre à chacun de générer des revenus de manière simple, transparente et accessible, tout en participant au développement des énergies renouvelables.
             </p>

             <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
               <p className="font-bold text-white mb-3">Grâce à notre système structuré, vous bénéficiez :</p>
               <ul className="space-y-2.5">
                 <li className="flex items-start gap-2.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    <span>de gains journaliers attractifs</span>
                 </li>
                 <li className="flex items-start gap-2.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    <span>d’un plan de parrainage avantageux</span>
                 </li>
                 <li className="flex items-start gap-2.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    <span>d’une plateforme sécurisée et fiable</span>
                 </li>
               </ul>
             </div>

             <p className="px-2">
               Avec SOLEIL-POWER, vous avez l’opportunité de faire travailler votre argent intelligemment tout en contribuant à un avenir énergétique plus durable.
             </p>

             <div className="mt-6">
               <p className="font-bold text-white mb-3 px-2 text-lg">Pourquoi nous rejoindre ?</p>
               <ul className="grid gap-3">
                 <li className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <span className="text-lg">✔️</span> <span className="text-white font-bold">Sécurité des transactions</span>
                 </li>
                 <li className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <span className="text-lg">✔️</span> <span className="text-white font-bold">Transparence totale</span>
                 </li>
                 <li className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <span className="text-lg">✔️</span> <span className="text-white font-bold">Rentabilité évolutive</span>
                 </li>
               </ul>
             </div>
             
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mt-8 shadow-inner">
                <p className="text-amber-500 mb-4 text-center">Rejoignez dès aujourd’hui la communauté SOLEIL-POWER et commencez à bâtir votre source de revenus dans l’énergie solaire.</p>
                <p className="text-white font-black tracking-wide text-center text-base uppercase">Investissez dans l’énergie, investissez dans votre avenir. ⚡</p>
             </div>

             <div className="mt-10 mb-8 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
               <img src="https://i.imgur.com/TH31utuh.jpg" alt="SOLEIL-POWER" className="w-full h-auto object-cover" />
             </div>

             <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-4">🔆 À propos de nos gains</h2>
               <p className="text-gray-300 font-medium leading-relaxed mb-4">
                 SOLEIL-POWER génère des revenus à travers l’exploitation de projets d’énergie solaire. L’entreprise investit dans l’installation et la gestion de panneaux solaires, puis revend l’électricité produite à des entreprises, des particuliers et des réseaux énergétiques.
               </p>
               <p className="text-gray-300 font-medium leading-relaxed mb-6">
                 Grâce à ces activités, des revenus stables sont générés chaque jour. Une partie de ces bénéfices est ensuite redistribuée aux investisseurs sous forme de gains journaliers.
               </p>
               
               <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
                 <p className="font-bold text-white mb-4">✔️ Un modèle basé sur :</p>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">La production d’énergie renouvelable</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">La vente d’électricité</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">Des partenariats énergétiques locaux et internationaux</span>
                   </li>
                 </ul>
               </div>
             </div>

             <div className="mt-10 mb-8 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
               <img src="https://i.imgur.com/EmiQxnA.jpeg" alt="Parrainage SOLEIL-POWER" className="w-full h-auto object-cover" />
             </div>

             <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-4">🚀 BOOSTEZ VOS REVENUS AVEC LE PARRAINAGE</h2>
               <p className="text-gray-300 font-medium leading-relaxed mb-6">
                 Invitez vos proches à rejoindre SOLEIL-POWER et gagnez des commissions sur leurs investissements.
               </p>

               <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 mb-6">
                 <p className="font-bold text-white mb-4">💰 Comment ça marche ?</p>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">Partagez votre lien de parrainage</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">Vos filleuls investissent sur la plateforme</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-gray-300">Vous recevez automatiquement des commissions</span>
                   </li>
                 </ul>
               </div>

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

               <p className="text-gray-300 font-medium leading-relaxed mb-6">
                 Plus votre réseau grandit, plus vos gains augmentent sans effort supplémentaire.
               </p>

               <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 shadow-inner">
                 <p className="text-amber-500 font-bold text-center">
                   🎯 Ne restez pas seul, construisez votre équipe et générez des revenus passifs dès aujourd’hui !
                 </p>
               </div>
             </div>

             <div className="mt-8">
               <h2 className="text-xl font-black text-white mb-6">📸 Notre Galerie</h2>
               <div className="grid grid-cols-2 gap-3 mb-8">
                 <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg aspect-square">
                   <img src="https://i.imgur.com/TPu2aYa.jpeg" alt="Installation 1" className="w-full h-full object-cover" />
                 </div>
                 <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg aspect-square">
                   <img src="https://i.imgur.com/13CtIKN.jpeg" alt="Installation 2" className="w-full h-full object-cover" />
                 </div>
                 <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg aspect-[4/3] col-span-2">
                   <img src="https://i.imgur.com/gK4vxdm.jpeg" alt="Installation 3" className="w-full h-full object-cover" />
                 </div>
                 <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg aspect-square col-span-2">
                   <img src="https://i.imgur.com/tDxIhSt.jpeg" alt="Installation 4" className="w-full h-full object-cover" />
                 </div>
               </div>
               
               <p className="text-gray-300 font-medium leading-relaxed bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 shadow-inner">
                 Chez <strong className="text-white">SOLEIL-POWER</strong>, nous croyons en un avenir où l’énergie est propre, accessible et durable pour tous. Chaque projet que nous réalisons, chaque formation que nous donnons et chaque collaboration que nous construisons repose sur des valeurs fortes : engagement, excellence et innovation. Grâce à la force du soleil, nous accompagnons nos partenaires et nos clients vers une indépendance énergétique réelle et rentable. Rejoignez-nous et faites partie d’une vision tournée vers le futur.
               </p>
             </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 px-5 pt-2 pb-8">
        {/* CTA */}
        <div>
            <Link to="/invest" className="w-full relative overflow-hidden group bg-amber-500 hover:bg-amber-400 text-black py-4.5 px-6 rounded-2xl flex items-center justify-between font-black shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all">
                <div className="flex flex-col text-left py-1">
                   <span className="text-[17px] tracking-wide leading-tight mb-0.5">Accéder aux générateurs</span>
                   <span className="text-black/60 text-[10px] uppercase font-bold tracking-widest">Voir les opportunités d'investissement</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors shrink-0">
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
            </Link>
        </div>

      </div>
    </div>
  );
}
