import { useState } from 'react';
import { CheckCircle2, ShieldCheck, TrendingUp, Award, Building2, MapPin, Users, Calendar, Factory, Eye, X } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

export function Dashboard() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const presentationItems = [
    {
      id: 'doc-1',
      image: '/images/presentation/image1.jpeg',
      fallbackImage: 'https://i.imgur.com/MyrZuHN.jpeg',
      title: 'INFORMATIONS & TRANSPARENCE',
      text: 'Cette présentation rassemble des informations relatives aux activités et à la présence de CargillCi en Côte d’Ivoire. Les éléments présentés sont destinés à permettre une meilleure compréhension de l’entreprise, de ses activités et de ses engagements.'
    },
    {
      id: 'doc-2',
      image: '/images/presentation/image2.jpg',
      fallbackImage: '/images/presentation/image2.jpg',
      title: 'ENGAGEMENT & CONFIANCE',
      text: 'CargillCi s’appuie sur une présence reconnue et des activités structurées dans le secteur agricole et alimentaire. La transparence, la responsabilité et le respect des partenaires constituent des principes essentiels dans la conduite de ses activités.'
    },
    {
      id: 'doc-3',
      image: '/images/presentation/image3.png',
      fallbackImage: 'https://i.imgur.com/q1Gy36v.png',
      title: 'ENGAGEMENT POUR LA QUALITÉ ET LA CONFORMITÉ',
      text: 'La qualité, la responsabilité et la conformité constituent des principes fondamentaux dans les activités de CargillCi. Ce document présente les engagements et domaines d’activité associés à CargillCi en Côte d’Ivoire.'
    },
    {
      id: 'doc-4',
      image: '/images/presentation/plans_tableau.png',
      fallbackImage: 'https://i.imgur.com/m65iX4H.png',
      title: 'PLANS D’INVESTISSEMENT DISPONIBLES',
      text: 'Découvrez ci-dessus les différents plans d’investissement disponibles sur notre plateforme. Chaque formule est conçue selon un niveau d’investissement précis, avec les gains correspondants présentés dans le tableau. Choisissez la formule adaptée à vos possibilités et consultez les conditions de la plateforme avant toute participation.'
    },
    {
      id: 'doc-5',
      image: '/images/presentation/image4.png',
      fallbackImage: 'https://i.imgur.com/1ybNOe6.png',
      title: 'PROGRAMME OFFICIEL DE COMMISSIONS & PARRAINAGE',
      text: 'Participez activement au développement de la communauté agricole CargillCi en invitant vos collaborateurs et proches. Profitez de notre grille de récompenses transparente et progressive pour chaque personne parrainée sur notre plateforme.'
    }
  ];

  const activities = [
    'Cacao',
    'Riz',
    'Igname',
    'Manioc',
    'Café',
    'Anacarde',
    'Palmier à huile',
    'Hévéa',
    'Coton'
  ];

  const ivoryCoastHighlights = [
    { label: 'Présence', value: 'Depuis 1997', icon: Calendar },
    { label: 'Secteurs principaux', value: 'Cacao et coton', icon: Building2 },
    { label: 'Transformation', value: 'Usine de Yopougon', icon: Factory },
    { label: 'Produits cacao', value: 'Liqueur, beurre, tourteaux et poudre', icon: MapPin },
    { label: 'Effectif annoncé', value: 'Plus de 570 personnes (officiel)', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[320px] h-[320px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent"></div>
        <div className="absolute top-[40%] right-[-10%] w-[380px] h-[380px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
      </div>

      {/* Header Section */}
      <div className="relative pt-6 px-5 z-10 max-w-xl mx-auto">
        <div className="w-full flex items-center justify-between mb-6">
          <AppLogo imgClassName="h-9 w-auto object-contain max-h-11" />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-emerald-700">En ligne</span>
          </div>
        </div>

        {/* Content flowing directly on the page (no card enclosures) */}
        <div className="space-y-7">
          
          {/* Main Title & Intro */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-500/20 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>🌱</span> CargillCi en Côte d'Ivoire
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              Acteur majeur de l’agriculture & de l’agroalimentaire
            </h1>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-normal">
              CargillCi est un acteur de l’agriculture et de l’agroalimentaire en Côte d’Ivoire. La plateforme collabore avec les producteurs et les coopératives afin de promouvoir des cultures durables à fort rendement.
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Section Présentation & Documents Officiels */}
          <div className="space-y-6">
            {presentationItems.map((item, index) => (
              <div key={item.id} className="space-y-3">
                {/* Image */}
                <div 
                  className="relative group rounded-2xl overflow-hidden bg-white border border-gray-200/90 shadow-xs cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => setSelectedImage(item.image)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-auto max-h-[360px] object-contain bg-neutral-900/5 mx-auto transition-opacity"
                    onError={(e) => {
                      // Fallback if local path fails
                      if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
                        e.currentTarget.src = item.fallbackImage;
                      }
                    }}
                  />
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Agrandir</span>
                  </div>
                </div>

                {/* Text directly underneath image */}
                <div className="space-y-1.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <h2 className="text-sm font-black tracking-tight text-gray-900 uppercase">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>

                {index < presentationItems.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent pt-3"></div>
                )}
              </div>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Nos Activités Agricoles */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                Nos Activités Agricoles
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              CargillCi développe principalement ses activités autour de :
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {activities.map((crop) => (
                <div 
                  key={crop}
                  className="flex items-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-black/10 shadow-xs"
                >
                  <span className="text-emerald-600 font-black text-sm">✓</span>
                  <span className="text-xs font-bold text-gray-800 truncate">{crop}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-500/20 text-xs sm:text-sm text-gray-800 leading-relaxed">
              <span className="font-bold text-amber-900">Transformation locale du cacao : </span>
              En Côte d’Ivoire, les filières agricoles valorisent notamment le cacao en <strong>liqueur de cacao</strong>, <strong>beurre de cacao</strong>, <strong>tourteaux</strong> et <strong>poudre de cacao</strong>.
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* De la ferme à la transformation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                De la ferme à la transformation
              </h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-normal">
              CargillCi collabore avec les agriculteurs, les coopératives et différents partenaires afin de construire une chaîne d’approvisionnement allant de la production agricole jusqu’à la transformation et la commercialisation.
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Cargill en Côte d'Ivoire */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇨🇮</span>
              <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                CargillCi en Côte d’Ivoire
              </h2>
            </div>

            <div className="space-y-2 pt-1">
              {ivoryCoastHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                      <span className="text-xs sm:text-sm font-black text-gray-900">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Avantages & Structure */}
          <div className="space-y-3">
            <p className="font-black text-gray-900 text-sm sm:text-base">
              Grâce à notre système structuré, vous bénéficiez :
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-800 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>De gains journaliers attractifs sur <strong>60 jours</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>D'un plan de parrainage avantageux (<strong>10% - 3% - 2%</strong>)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>D'une gestion sécurisée, fiable et transparente</span>
              </li>
            </ul>

            <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed pt-1">
              Vous avez l'opportunité de faire fructifier votre argent intelligemment tout en participant activement à l'économie agricole productive.
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Pourquoi nous rejoindre */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pourquoi nous rejoindre ?</h2>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Sécurité totale des transactions</p>
                  <p className="text-xs text-gray-500">Protocoles bancaires et conformité rigoureuse</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Transparence des rendements</p>
                  <p className="text-xs text-gray-500">Suivi quotidien en temps réel sur votre tableau de bord</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Rentabilité stable et garantie</p>
                  <p className="text-xs text-gray-500">Génération continue liée aux flux des récoltes réelles</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-2xl max-h-[90vh] w-full flex items-center justify-center overflow-auto">
            <img 
              src={selectedImage} 
              alt="Document agrandi" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
