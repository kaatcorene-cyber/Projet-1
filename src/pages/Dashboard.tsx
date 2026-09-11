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
      <div className="relative pt-6 px-4 z-10">
        <div className="w-full flex items-center justify-between mb-4">
          <AppLogo imgClassName="h-9 w-auto object-contain max-h-11" />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-emerald-700">En ligne</span>
          </div>
        </div>

        {/* Hero Presentation */}
        <div className="relative w-full mt-2 space-y-5">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-emerald-300 text-xs font-bold mb-3 uppercase tracking-wider">
                <span>🌱</span> Bienvenue chez Cargill
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white mb-3">
                Acteur mondial de l’agriculture & de l’agroalimentaire
              </h1>
              <p className="text-emerald-100/90 text-sm font-normal leading-relaxed">
                Cargill est un acteur mondial de l’agriculture et de l’agroalimentaire, présent en Côte d’Ivoire depuis 1997. L’entreprise travaille avec les producteurs et les coopératives afin de s’approvisionner en matières premières agricoles et de développer des chaînes d’approvisionnement durables.
              </p>
            </div>
          </div>

          {/* Nos Activités Agricoles */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
                🌾
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">NOS ACTIVITÉS AGRICOLES</h2>
                <p className="text-xs text-gray-500 font-medium">Cargill développe principalement ses activités autour de :</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {activities.map((crop) => (
                <div 
                  key={crop}
                  className="flex items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-500/15 hover:bg-emerald-50 transition-colors"
                >
                  <span className="text-emerald-600 font-black text-sm">✓</span>
                  <span className="text-xs font-bold text-gray-800 truncate">{crop}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-amber-50/80 to-emerald-50/80 rounded-2xl p-4 border border-amber-500/20 text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
              <span className="font-bold text-amber-900 block mb-1">Transformation locale du cacao :</span>
              En Côte d’Ivoire, Cargill transforme notamment le cacao en <strong>liqueur de cacao</strong>, <strong>beurre de cacao</strong>, <strong>tourteaux</strong> et <strong>poudre de cacao</strong>.
            </div>
          </div>

          {/* De la ferme à la transformation */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                DE LA FERME À LA TRANSFORMATION
              </h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Cargill collabore avec les agriculteurs, les coopératives et différents partenaires afin de construire une chaîne d’approvisionnement allant de la production agricole jusqu’à la transformation et la commercialisation.
            </p>
          </div>

          {/* Cargill en Côte d'Ivoire */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇨🇮</span>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                CARGILL EN CÔTE D’IVOIRE
              </h2>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/40">
              {ivoryCoastHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avantages & Structure */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-3xl p-5 sm:p-6 border border-emerald-500/20 shadow-sm space-y-3.5">
            <p className="font-black text-gray-900 text-sm sm:text-base">
              Grâce à notre système structuré, vous bénéficiez :
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-gray-800">
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

            <div className="pt-2 border-t border-emerald-500/20 text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              Vous avez l'opportunité de faire fructifier votre argent intelligemment tout en participant activement à l'économie agricole productive.
            </div>
          </div>

          {/* Pourquoi nous rejoindre */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pourquoi nous rejoindre ?</h2>
            </div>
            <div className="grid gap-2.5">
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900">Sécurité totale des transactions</p>
                  <p className="text-xs text-gray-500 font-medium">Protocoles bancaires et conformité rigoureuse</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900">Transparence des rendements</p>
                  <p className="text-xs text-gray-500 font-medium">Suivi quotidien en temps réel sur votre tableau de bord</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900">Rentabilité stable et garantie</p>
                  <p className="text-xs text-gray-500 font-medium">Génération continue liée aux flux des récoltes réelles</p>
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
