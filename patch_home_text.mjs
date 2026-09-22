import fs from 'fs';

const content = `import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { ArrowDownToLine, ArrowUpToLine, Clock, ShieldCheck, Leaf, Zap, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1000&q=80"
];

export function Home() {
  const { user } = useAuthStore();
  const { config } = useAppStore();
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const closeJoinModal = () => {
    setShowJoinModal(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-5 pt-16 pb-32 min-h-[100dvh] font-sans relative overflow-hidden bg-[#03296c]">
      
      {/* Modal Bienvenue */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden max-w-sm w-full flex flex-col shadow-2xl relative"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-black text-white mb-4">Bienvenue sur ElevFinAi</h2>
                <p className="text-white/80 text-[15px] font-medium mb-8 leading-relaxed">
                  Votre plateforme dédiée à l'investissement. Découvrez nos différentes opportunités et générez des revenus passifs sécurisés.
                </p>
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-[#0088cc] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 active:scale-95 transition-transform"
                  >
                    Rejoindre notre communauté Telegram
                  </a>
                  <button 
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-[#03296c] text-blue-200/60 rounded-2xl font-bold text-sm hover:bg-white/5 hover:text-white/90 active:scale-95 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Accueil</h1>
        <p className="text-blue-200/60 font-medium text-sm mt-1">Plateforme d'investissement ElevFinAi</p>
      </header>

      {/* Image Slider */}
      <div className="relative w-full h-[220px] rounded-[32px] overflow-hidden mb-8 shadow-2xl border border-white/10">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={BANNER_IMAGES[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#03296c] via-[#03296c]/20 to-transparent"></div>
        <div className="absolute bottom-5 left-0 right-0 flex justify-center items-end z-10">
           <div className="flex gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
             {BANNER_IMAGES.map((_, i) => (
               <div key={i} className={\`h-1.5 rounded-full transition-all duration-300 \${i === currentSlide ? 'w-5 bg-brand-500' : 'w-2 bg-white/50'}\`} />
             ))}
           </div>
        </div>
      </div>

      {/* Main Descriptive Content - Replaces the cards and concept block */}
      <div className="text-white space-y-8 pb-10">
        
        <section>
          <h2 className="text-2xl font-black mb-4 text-brand-400 flex items-center gap-2">
             <Leaf className="w-6 h-6" />
             Qui sommes-nous ?
          </h2>
          <div className="space-y-4 text-blue-100/90 text-[15px] leading-relaxed font-medium">
            <p>
              Bienvenue sur <strong className="text-white">ElevFinAi</strong>, l'entreprise leader spécialisée dans la transformation, la commercialisation et l'exportation de jus de fruits 100% naturels et biologiques. 
            </p>
            <p>
              Notre mission est de démocratiser l'accès à un marché en pleine expansion. Contrairement aux systèmes d'investissement traditionnels fermés et complexes, nous avons choisi de vous associer directement à notre croissance. En devenant partenaire financier, vous financez l'achat de nos matières premières (fruits frais) et notre processus d'extraction. En retour, nous partageons quotidiennement avec vous les bénéfices générés par la vente de nos produits à l'échelle internationale.
            </p>
            <p>
              Chaque plan d'investissement correspond à une de nos lignes de production exclusives (Fraise, Pastèque, Kiwi, etc.). Votre argent travaille de manière concrète et transparente au cœur de l'économie réelle.
            </p>
          </div>
        </section>

        <section className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-lg">
          <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2">
             <Info className="w-5 h-5 text-brand-400" />
             Règles et Fonctionnement
          </h2>
          
          <ul className="space-y-6">
            <li className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Dépôts</h3>
                <p className="text-blue-200/80 text-sm mt-1 leading-relaxed">
                  Le montant minimum pour effectuer un dépôt sur votre compte est fixé à <strong className="text-white">2 000 FCFA</strong>. Les recharges sont traitées automatiquement et disponibles sur votre solde presque instantanément.
                </p>
              </div>
            </li>

            <li className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-1">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Gains et Cycles</h3>
                <p className="text-blue-200/80 text-sm mt-1 leading-relaxed">
                  Une fois que vous achetez un pack de jus, les rendements sont calculés sur un cycle précis. Vous récupérez vos bénéfices toutes les 24 heures sans interruption.
                </p>
              </div>
            </li>

            <li className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-1">
                <ArrowUpToLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Retraits</h3>
                <p className="text-blue-200/80 text-sm mt-1 leading-relaxed">
                  Le minimum de retrait autorisé est de <strong className="text-white">1 000 FCFA</strong>. Vous pouvez effectuer une demande de retrait à n'importe quel moment de la journée (24/7). Cependant, pour éviter les abus, <strong className="text-brand-400">vous devez posséder au moins un (1) pack actif</strong> pour être autorisé à retirer vos fonds.
                </p>
              </div>
            </li>

            <li className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Sécurité et Fiabilité</h3>
                <p className="text-blue-200/80 text-sm mt-1 leading-relaxed">
                  Notre système financier est protégé par des protocoles stricts. Vos données personnelles et vos transactions sont chiffrées de bout en bout pour garantir une tranquillité d'esprit totale.
                </p>
              </div>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Home.tsx', content);
