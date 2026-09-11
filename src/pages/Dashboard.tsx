import { ArrowRight, CheckCircle2, ShieldCheck, TrendingUp, Award, Building2, MapPin, Users, Calendar, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';

export function Dashboard() {
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
              <span>🌱</span> Cargill en Côte d'Ivoire
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              Acteur mondial de l’agriculture & de l’agroalimentaire
            </h1>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-normal">
              Cargill est un acteur mondial de l’agriculture et de l’agroalimentaire, présent en Côte d’Ivoire depuis 1997. L’entreprise travaille avec les producteurs et les coopératives afin de s’approvisionner en matières premières agricoles et de développer des chaînes d’approvisionnement durables.
            </p>
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
              Cargill développe principalement ses activités autour de :
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
              En Côte d’Ivoire, Cargill transforme notamment le cacao en <strong>liqueur de cacao</strong>, <strong>beurre de cacao</strong>, <strong>tourteaux</strong> et <strong>poudre de cacao</strong>.
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
              Cargill collabore avec les agriculteurs, les coopératives et différents partenaires afin de construire une chaîne d’approvisionnement allant de la production agricole jusqu’à la transformation et la commercialisation.
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Cargill en Côte d'Ivoire */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇨🇮</span>
              <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                Cargill en Côte d’Ivoire
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

      {/* CTA Button */}
      <div className="relative z-10 px-4 pt-6 pb-8">
        <Link 
          to="/invest" 
          className="w-full relative overflow-hidden group bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 rounded-2xl flex items-center justify-between font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
        >
          <div className="flex flex-col text-left">
            <span className="text-base tracking-wide leading-tight mb-0.5">Accéder aux cultures</span>
            <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Découvrir les plans d’investissement</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
