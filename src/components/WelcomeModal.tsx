import React from 'react';
import { 
  CheckCircle2, 
  Truck, 
  Globe2, 
  ShieldCheck, 
  Send, 
  ArrowRight, 
  X, 
  Sparkles,
  Award
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  telegramLink?: string;
}

export function WelcomeModal({ isOpen, onClose, userName, telegramLink = 'https://t.me/+5i6UubrC1mtmMDg0' }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
      id="welcome-modal-overlay"
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]"
        id="welcome-modal-card"
      >
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 sm:p-7 text-center overflow-hidden">
          {/* Subtle Background Pattern Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            aria-label="Fermer le message de bienvenue"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white/90 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Official Badge */}
          <div className="flex flex-col items-center">
            <div className="bg-white/95 p-2 rounded-2xl shadow-lg mb-3 inline-flex">
              <AppLogo imgClassName="h-10 w-auto object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-200 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Plateforme Officielle Agro-Logistique</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bienvenue sur AgriTrans !
            </h2>

            {userName && (
              <p className="text-emerald-100 text-xs sm:text-sm font-semibold mt-1">
                Ravi de vous retrouver, <span className="text-white font-black">{userName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center font-medium">
            AgriTrans vous accompagne dans le développement et la rentabilisation de la chaîne logistique agro-pastorale en Afrique de l'Ouest.
          </p>

          {/* Highlights Grid */}
          <div className="space-y-2.5">
            {/* 1. Flotte */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Flottes de Transport en Rotation
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                  Souscrivez à un véhicule certifié et collectez vos gains journaliers toutes les 24h sur votre solde.
                </p>
              </div>
            </div>

            {/* 2. UEMOA Countries */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20 mt-0.5">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Déploiement Panafricain (5 Pays)
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                  Retraits rapides et fiables disponibles en Côte d'Ivoire 🇨🇮, Togo 🇹🇬, Burkina Faso 🇧🇫, Bénin 🇧🇯 et Niger 🇳🇪.
                </p>
              </div>
            </div>

            {/* 3. Sécurité */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-600/20 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Retraits & Sécurité Garantis
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                  Vos fonds et transactions Mobile Money sont protégés par nos protocoles stricts de vérification financière.
                </p>
              </div>
            </div>
          </div>

          {/* Telegram Channel Reminder */}
          {telegramLink && (
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-sky-900 hover:bg-sky-100 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black">Canal Officiel Telegram</p>
                  <p className="text-[10px] text-sky-700">Restez informé de l’actualité et des primes de flotte</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                Rejoindre &rarr;
              </span>
            </a>
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            id="welcome-modal-continue-btn"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Accéder à mon compte</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
