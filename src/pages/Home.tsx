import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
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
                <h2 className="text-2xl font-black text-white mb-4">Bienvenue sur AGROCI</h2>
                <p className="text-white/80 text-[15px] font-medium mb-8 leading-relaxed">
                  Votre plateforme dédiée au développement agricole en Côte d'Ivoire. Découvrez nos différentes productions et participez à une agriculture moderne et durable.
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
        <p className="text-blue-200/60 font-medium text-sm mt-1">Cultiver aujourd’hui, construire demain.</p>
      </header>

      {/* Image Slider */}
      <div className="relative w-full h-[220px] rounded-[32px] overflow-hidden mb-10 shadow-2xl border border-white/10">
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
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 bg-brand-500' : 'w-2 bg-white/50'}`} />
             ))}
           </div>
        </div>
      </div>

      <div className="text-white pb-10 max-w-lg mx-auto">
        
        {/* Document Unifié */}
        <div className="space-y-10">
          
          {/* Intro */}
          <div>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              <strong className="text-white text-lg font-black">AGROCI</strong> est un projet agro-agricole ayant pour ambition de participer au développement d’une agriculture moderne, productive et accessible en Côte d’Ivoire.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              À travers une approche combinant agriculture, technologie et innovation, AGROCI souhaite développer et valoriser différentes productions agricoles tout en créant de nouvelles opportunités autour du secteur agricole.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              Notre vision repose sur un principe simple : <strong className="text-brand-400">transformer le potentiel agricole en valeur durable</strong>.
            </p>
          </div>

          {/* Mission */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🎯 Notre Mission</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              La mission d’AGROCI est de contribuer au développement de projets agricoles structurés autour de la production, de la valorisation et de la commercialisation des produits agricoles.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-2">Nous souhaitons notamment :</p>
            <ul className="space-y-2 text-blue-100/90 text-[15px] ml-1">
              <li>• développer des projets agricoles modernes ;</li>
              <li>• favoriser la production de différentes cultures ;</li>
              <li>• améliorer la valorisation des produits agricoles ;</li>
              <li>• encourager l’utilisation des technologies dans l’agriculture ;</li>
              <li>• créer des opportunités économiques autour du secteur agricole ;</li>
              <li>• participer au développement des communautés rurales ;</li>
              <li>• contribuer à une agriculture plus productive et durable.</li>
            </ul>
          </div>

          {/* Vision */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🌍 Notre Vision</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              Notre ambition est de faire d’AGROCI une marque agricole moderne et reconnue en Côte d’Ivoire et, à terme, dans la sous-région ouest-africaine.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              AGROCI veut construire un modèle reposant sur la production, l’innovation, la transparence, la qualité et le développement durable.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              L’agriculture représente un secteur stratégique pour la Côte d’Ivoire et demeure un important moteur d’activité économique et d’emploi. Le gouvernement ivoirien met d’ailleurs aujourd’hui l’accent sur la modernisation, l’innovation, la transformation locale et la digitalisation du secteur.
            </p>
          </div>

          {/* Activités */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🌾 Nos Activités</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-6">AGROCI peut développer ses activités autour de plusieurs domaines :</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Production agricole</h3>
                <p className="text-blue-100/80 text-[14px] leading-relaxed">Développement et exploitation de cultures agricoles adaptées aux conditions locales et aux besoins du marché.</p>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Valorisation agricole</h3>
                <p className="text-blue-100/80 text-[14px] leading-relaxed">Transformation, conditionnement et mise en valeur des productions afin d’augmenter leur valeur ajoutée.</p>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Commercialisation</h3>
                <p className="text-blue-100/80 text-[14px] leading-relaxed">Mise en relation des productions agricoles avec les marchés, distributeurs et consommateurs.</p>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Agriculture numérique</h3>
                <p className="text-blue-100/80 text-[14px] leading-relaxed">Utilisation des outils numériques pour améliorer le suivi des projets, la gestion des activités et la communication avec les différents acteurs.</p>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Développement de projets agricoles</h3>
                <p className="text-blue-100/80 text-[14px] leading-relaxed">Mise en place de projets spécialisés autour de différentes cultures et chaînes de valeur.</p>
              </div>
            </div>
          </div>

          {/* Productions */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🍓 Nos Productions</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">AGROCI souhaite mettre en avant différentes catégories de productions agricoles, notamment :</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['🍓 Fraise', '🍉 Pastèque', '🥝 Kiwi', '🍇 Raisin', '🍒 Cerise', '🍋 Citron', '🍏 Pomme verte', '🍌 Banane'].map(fruit => (
                <span key={fruit} className="bg-white/10 text-white px-3 py-1.5 rounded-full text-[14px] font-medium border border-white/5">{fruit}</span>
              ))}
            </div>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              Chaque production peut faire l’objet d’un projet agricole spécifique comprenant la production, le suivi, la récolte, la valorisation et la commercialisation.
            </p>
          </div>

          {/* Digital */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">💻 AGROCI Digital</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              Afin de moderniser la gestion de ses activités, AGROCI peut s’appuyer sur une plateforme numérique permettant de centraliser les informations relatives aux différents projets agricoles.
            </p>
          </div>

          {/* Valeurs */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🤝 Nos Valeurs</h2>
            <ul className="space-y-4">
              <li>
                <strong className="text-white block text-base">QUALITÉ</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous accordons une importance particulière à la qualité des productions et des services proposés.</span>
              </li>
              <li>
                <strong className="text-white block text-base">INNOVATION</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous cherchons constamment à intégrer de nouvelles technologies et méthodes permettant d’améliorer nos activités.</span>
              </li>
              <li>
                <strong className="text-white block text-base">TRANSPARENCE</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous souhaitons établir des relations basées sur des informations claires et une communication responsable.</span>
              </li>
              <li>
                <strong className="text-white block text-base">DURABILITÉ</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous encourageons une agriculture capable de créer de la valeur tout en préservant les ressources naturelles.</span>
              </li>
              <li>
                <strong className="text-white block text-base">PROXIMITÉ</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous voulons rester proches des producteurs, partenaires, clients et communautés.</span>
              </li>
              <li>
                <strong className="text-white block text-base">PERFORMANCE</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Nous recherchons l’efficacité à chaque étape, de la production jusqu’à la commercialisation.</span>
              </li>
            </ul>
          </div>

          {/* Engagement */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">👨‍🌾 Notre Engagement</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              AGROCI souhaite participer à la construction d’un secteur agricole plus moderne, mieux organisé et davantage connecté aux nouvelles technologies. Notre engagement repose sur trois piliers :
            </p>
            <ul className="space-y-4">
              <li>
                <strong className="text-white block text-base">PRODUIRE</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Développer des productions agricoles répondant aux besoins du marché.</span>
              </li>
              <li>
                <strong className="text-white block text-base">VALORISER</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Donner davantage de valeur aux productions grâce au conditionnement, à la transformation et à la commercialisation.</span>
              </li>
              <li>
                <strong className="text-white block text-base">INNOVER</strong>
                <span className="text-blue-100/80 text-[14px] leading-relaxed">Utiliser les outils numériques et les nouvelles technologies pour améliorer la gestion et le suivi des activités.</span>
              </li>
            </ul>
          </div>

          {/* Modèle */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">📈 Notre Modèle de Développement</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-6">Le développement d’AGROCI s’articule autour de plusieurs étapes :</p>
            <div className="space-y-4">
              <div>
                <strong className="text-white text-[15px]">1. Identification des opportunités agricoles</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Étudier les besoins du marché et les possibilités de production.</p>
              </div>
              <div>
                <strong className="text-white text-[15px]">2. Mise en place des projets</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Sélectionner les cultures et organiser les différentes opérations agricoles.</p>
              </div>
              <div>
                <strong className="text-white text-[15px]">3. Production</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Assurer le suivi des cultures et des opérations agricoles.</p>
              </div>
              <div>
                <strong className="text-white text-[15px]">4. Récolte et valorisation</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Récolter, conditionner et préparer les produits.</p>
              </div>
              <div>
                <strong className="text-white text-[15px]">5. Commercialisation</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Distribuer les productions auprès des différents marchés.</p>
              </div>
              <div>
                <strong className="text-white text-[15px]">6. Développement</strong>
                <p className="text-blue-100/80 text-[14px] mt-1">Réinvestir dans l’amélioration des infrastructures, des technologies et des capacités de production.</p>
              </div>
            </div>
          </div>

          {/* Environnement */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🌱 Responsabilité Environnementale</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">AGROCI souhaite promouvoir une agriculture plus responsable à travers :</p>
            <ul className="space-y-2 text-blue-100/90 text-[15px] ml-1">
              <li>• une utilisation raisonnée des ressources ;</li>
              <li>• la protection des sols ;</li>
              <li>• une meilleure gestion de l’eau ;</li>
              <li>• la réduction des pertes agricoles ;</li>
              <li>• la valorisation des déchets agricoles ;</li>
              <li>• l’adoption progressive de pratiques agricoles durables.</li>
            </ul>
          </div>

          {/* Côte d'Ivoire */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🇨🇮 AGROCI et la Côte d'Ivoire</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">
              La Côte d’Ivoire dispose d’un secteur agricole particulièrement important. Les données publiques récentes soulignent notamment le poids de l’agriculture dans l’économie nationale et l’importance des cultures vivrières et d’exportation.
            </p>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              AGROCI souhaite s’inscrire dans cette dynamique en développant des activités agricoles créatrices de valeur et en contribuant à la modernisation du secteur.
            </p>
          </div>

          {/* Ambitions */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🚀 Nos Ambitions</h2>
            <p className="text-blue-100/90 text-[15px] leading-relaxed mb-4">À moyen et long terme, AGROCI ambitionne de :</p>
            <ul className="space-y-2 text-blue-100/90 text-[15px] ml-1">
              <li>• développer plusieurs exploitations agricoles ;</li>
              <li>• diversifier ses productions ;</li>
              <li>• développer des infrastructures de transformation ;</li>
              <li>• renforcer son réseau de distribution ;</li>
              <li>• créer des emplois directs et indirects ;</li>
              <li>• développer des partenariats agricoles ;</li>
              <li>• intégrer davantage de technologies dans la gestion agricole ;</li>
              <li>• étendre progressivement ses activités à l’échelle régionale.</li>
            </ul>
          </div>

          {/* Identité Entreprise */}
          <div>
            <h2 className="text-xl font-black text-brand-400 mb-4 border-b border-white/10 pb-2">🏢 Identité de l'Entreprise</h2>
            <div className="bg-[#021f54] p-5 rounded-2xl border border-brand-500/20 shadow-inner">
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-blue-200/60">Nom</span>
                  <span className="font-bold text-white">AGROCI</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-blue-200/60">Secteur</span>
                  <span className="font-bold text-white text-right">Agriculture & Agro-industrie</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-blue-200/60">Zone d'activité</span>
                  <span className="font-bold text-white">Côte d'Ivoire</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-blue-200/60">Domaine</span>
                  <span className="font-bold text-white text-right">Production, valorisation et commercialisation agricole</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-blue-200/60">Positionnement</span>
                  <span className="font-bold text-white text-right">Agriculture moderne et innovation</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-blue-200/60 w-1/3">Vision</span>
                  <span className="font-bold text-white text-right w-2/3">Construire une agriculture plus productive, moderne et durable.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-6 pb-2 text-center">
            <h2 className="text-brand-400 text-sm font-black tracking-widest uppercase mb-2">🔰 Notre Signature</h2>
            <p className="text-white font-black text-lg italic">AGROCI — Cultiver aujourd’hui, construire demain.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
