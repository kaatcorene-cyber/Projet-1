import { Activity, Wallet, ArrowDownToLine, ArrowUpFromLine, ChevronRight, Sprout, CheckCircle2, Radio } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';

export function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Bar - Clear, bright and clean */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 transition-all">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <AppLogo imgClassName="h-9 w-auto object-contain max-h-10" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-full text-[11px] font-black text-emerald-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Réseau Actif 24/7
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - Direct page flow (no cards) */}
      <div className="pt-3 max-w-xl mx-auto space-y-6">

        {/* Section 1: Solde & Actions Directes */}
        <section className="bg-white border-y border-slate-200 px-4 sm:px-6 py-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                Solde Disponible
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {formatCurrency(user?.balance || 0)}
              </h2>
            </div>

            <Link
              to="/activity"
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-black transition-all active:scale-95"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Ma Flotte</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Direct Dual Action Buttons - Big, bright and visible */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/deposit"
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4 text-white" />
              <span>Recharger</span>
            </Link>

            <Link
              to="/withdraw"
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all active:scale-95 cursor-pointer"
            >
              <ArrowUpFromLine className="w-4 h-4 text-amber-400" />
              <span>Retirer Gains</span>
            </Link>
          </div>
        </section>

        {/* Section 2: Banner Présentation AgriTrans */}
        <section className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white px-5 sm:px-6 py-6 border-y border-emerald-950 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5 text-emerald-300" />
              Agro-Logistique & Transport Routier
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-white">
              L'infrastructure de transport au cœur des récoltes ivoiriennes
            </h1>
            
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
              AgriTrans assure la collecte directe bord champ, l’acheminement des récoltes et le transport conteneurisé vers les ports d'Abidjan et San-Pédro. Participez à l’exploitation de la flotte avec reversement quotidien garanti des revenus.
            </p>
          </div>
        </section>

        {/* Section 3: Chiffres Clés Directs (Horizontal Ribbon) */}
        <section className="bg-white border-y border-slate-200 px-4 sm:px-6 py-4 grid grid-cols-3 divide-x divide-slate-200 text-center shadow-sm">
          <div className="px-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">480+</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Camions Actifs</p>
          </div>
          <div className="px-2">
            <p className="text-xl sm:text-2xl font-black text-slate-900">99.8%</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Livraison Ponctuelle</p>
          </div>
          <div className="px-2">
            <p className="text-xl sm:text-2xl font-black text-amber-600">80 Jours</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Cycle Rentable</p>
          </div>
        </section>

        {/* Section 4: TOUT CE QU'IL FAUT SAVOIR SUR L'AGRI-LOGISTIQUE & TRANSPORT ROUTIER */}
        <section className="bg-white border-y border-slate-200 px-4 sm:px-6 py-6 shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                Guide Officiel : Agri-Logistique & Transport Routier
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">
              Comprendre le cœur névralgique de l’approvisionnement et du transport agricole en Côte d’Ivoire
            </p>
          </div>

          {/* Définition et enjeu national */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🚛</span>
              <span>Qu’est-ce que l’Agri-Logistique Routière ?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              L’agri-logistique routière regroupe l’ensemble des opérations de <strong>collecte, conditionnement, chargement, pesage et acheminement terrestre</strong> des productions agricoles (cacao, café, anacarde, hévéa, vivriers) depuis les plantations intérieures jusqu’aux usines de transformation et aux terminaux maritimes d’Abidjan et San-Pédro.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200 font-medium">
              En Côte d’Ivoire, premier producteur mondial de fèves de cacao et de noix de cajou, <strong>plus de 92% des volumes récoltés</strong> transitent obligatoirement par camion sur les axes routiers avant toute exportation.
            </p>
          </div>

          {/* Les 4 étapes clés du circuit logistique */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Les 4 Étapes Clés du Trajet Logistique AgriTrans
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="text-xs font-black text-slate-900">Collecte Bord-Champ & Pesage</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Enlèvement direct auprès des coopératives agricoles avec édition de bordereaux certifiés et passage sur pont-bascule étalonné.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">2</span>
                  <h4 className="text-xs font-black text-slate-900">Bâchage Sécurisé Anti-Humidité</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Protection étanche et aération contrôlée des cargaisons pour préserver les fèves des intempéries et de la condensation en route.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">3</span>
                  <h4 className="text-xs font-black text-slate-900">Corridors Routiers & Télématique</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Traversée des corridors stratégiques (Soubré, Daloa, Bouaké, San-Pédro) sous géolocalisation satellitaire active et vitesse régulée.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">4</span>
                  <h4 className="text-xs font-black text-slate-900">Dépotage Portuaire & Export</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Livraison prioritaire aux zones d’empotage des terminaux portuaires pour chargement maritime sans attente ni rupture de stock.
                </p>
              </div>
            </div>
          </div>

          {/* Normes et garanties AgriTrans */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
              Sécurité, Conformité UEMOA & Traçabilité
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 leading-relaxed font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Règlement 14 UEMOA :</strong> Respect strict du poids à l’essieu pour préserver les axes routiers et éviter les immobilisations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Assistance Mobile 24/7 :</strong> Camions-ateliers déployés sur les axes majeurs pour intervenir en moins de 45 minutes en cas d’avarie.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Assurance Fret Tous Risques :</strong> Chaque convoi est garanti à 100% contre le vol, l’accident et les sinistres météorologiques.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: FILIÈRES AGRICOLES & LOGISTIQUE DESSERVIE */}
        <section className="bg-white border-y border-slate-200 px-4 sm:px-6 py-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              FILIÈRES AGRICOLES & LOGISTIQUE DESSERVIE
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
              Rotations quotidiennes sur l’ensemble du territoire ivoirien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              'Filière Cacao & Café',
              'Noix d’Anacarde (Cajou)',
              'Hévéa & Latex',
              'Produits Vivriers Marchés',
              'Huile de Palme & Coton',
              'Transit Port Autonome',
              'Bâchées de Piste Rurale',
              'Camions 10 Tonnes & 20T',
              'Corridors San-Pédro / Abidjan'
            ].map((filiere) => (
              <div 
                key={filiere}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 font-black text-xs text-slate-900 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{filiere}</span>
              </div>
            ))}
          </div>

          {/* Sécurisation Agro-Routière */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-1">
            <p className="font-black text-emerald-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Sécurisation Agro-Routière
            </p>
            <p className="font-medium text-slate-700">
              Chaque camion est géo-localisé par balise GPS avec contrôle permanent de la vitesse et assistance dépannage mobile 24h/24 sur les axes ruraux et autoroutiers.
            </p>
          </div>
        </section>

        {/* Section 5: AGRITRANS CÔTE D'IVOIRE Réseau Homologué */}
        <section className="bg-white border-y border-slate-200 px-4 sm:px-6 py-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🇨🇮</span>
                <span>AGRITRANS CÔTE D'IVOIRE</span>
              </h2>
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mt-0.5">
                Réseau Homologué
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
              Certifié RCI
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Implantation RCI</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Depuis 2014 en Côte d’Ivoire</span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bassins desservis</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Daloa, Soubré, San-Pédro, Bouaké, Korhogo</span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hubs de transit</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Abidjan (Vridi & Yopougon) et San-Pédro</span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parc en circulation</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">Plus de 480 camions & véhicules actifs</span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membres & conducteurs</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Plus de 750 chauffeurs et partenaires</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
