import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Wallet, 
  ChevronRight,
  PlusCircle,
  Banknote,
  Users,
  ExternalLink,
  LogOut,
  PhoneCall,
  Phone,
  Calendar,
  CreditCard,
  Download,
  Smartphone,
  CheckCircle2,
  Truck,
  X
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';
import { WelcomeModal } from '../components/WelcomeModal';

export function Profile() {
  const { user, logout, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [groupLink, setGroupLink] = useState('https://t.me/+5i6UubrC1mtmMDg0');
  const [supportLink, setSupportLink] = useState('https://t.me/AgriTrans_01');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');

  // Check if welcome message should be displayed on login
  useEffect(() => {
    if (!user) return;
    try {
      const shouldShow = sessionStorage.getItem('agritrans_show_welcome');
      const shownForSession = sessionStorage.getItem('agritrans_welcome_shown_for_session');
      if (shouldShow === 'true' || !shownForSession) {
        setShowWelcomeModal(true);
      }
    } catch (e) {}
  }, [user]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    try {
      sessionStorage.removeItem('agritrans_show_welcome');
      sessionStorage.setItem('agritrans_welcome_shown_for_session', 'true');
    } catch (e) {}
  };

  // Auto verify pending MoneyFusion deposit
  useEffect(() => {
    async function checkDeposit() {
      const saved = localStorage.getItem('agritrans_pending_deposit');
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        if (!data || !data.token) return;

        const res = await fetch(`/api/moneyfusion/verify?token=${data.token}&txId=${data.txId || ''}&userId=${user?.id || ''}`);
        if (res.ok) {
          const result = await res.json();
          if (result.credited || result.status === 'already_completed') {
            await refreshUser();
            setDepositSuccessMsg(`Dépôt de ${formatCurrency(data.amount || 0)} validé automatiquement avec succès !`);
            localStorage.removeItem('agritrans_pending_deposit');
          }
        }
      } catch (e) {
        console.warn('Profile deposit check error:', e);
      }
    }

    checkDeposit();
    const interval = setInterval(checkDeposit, 6000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user?.id, refreshUser]);

  useEffect(() => {
    supabase.from('settings').select('*').in('key', ['telegram_link', 'whatsapp_support', 'support_link', 'official_group']).then(({ data }) => {
      if (data) {
        const group = data.find(s => s.key === 'telegram_link' || s.key === 'official_group');
        const support = data.find(s => s.key === 'whatsapp_support' || s.key === 'support_link');
        if (group && group.value) setGroupLink(group.value);
        if (support && support.value) setSupportLink(support.value);
      }
    });

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSupportRedirect = () => {
    navigate('/support');
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowDownloadModal(false);
      }
    } else {
      // Show instructional modal
      setShowDownloadModal(true);
    }
  };

  const formattedDate = user?.created_at 
    ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })
    : 'Récemment';

  const displayPhone = user?.phone 
    ? (user.phone.startsWith('+') ? user.phone : `+225 ${user.phone}`)
    : 'Numéro non renseigné';

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center transition-all">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">Mon Compte</h1>
          <p className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">Espace Partenaire AgriTrans</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-lg mx-auto space-y-4 px-3 sm:px-0">
        
        {/* Success Deposit Alert */}
        {depositSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{depositSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setDepositSuccessMsg('')} 
              className="text-emerald-700 hover:text-emerald-900 ml-2"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Identity Direct Band */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-mono tracking-tight">
                {displayPhone}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date d’inscription : {formattedDate}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Actif</span>
          </div>
        </div>

        {/* Main Balance Direct Band */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                Solde Disponible
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mt-1">
                {formatCurrency(Number(user?.balance) || 0)}
              </h2>
            </div>
          </div>

          {/* Actions Recharger / Retirer */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link 
              to="/deposit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recharger</span>
            </Link>
            <Link 
              to="/withdraw" 
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs active:scale-98 cursor-pointer"
            >
              <Banknote className="w-4 h-4 text-emerald-700" />
              <span>Retirer</span>
            </Link>
          </div>
        </div>

        {/* Navigation Menu Direct Rows */}
        <div className="space-y-2">
          {/* Ma Flotte (Véhicules actifs & Gains) */}
          <Link
            to="/activity"
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-900 text-sm font-black block">Ma Flotte (Véhicules actifs)</span>
                <span className="text-slate-500 text-xs font-medium">Rotation 24h & encaissement des gains journaliers</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>

          {/* Informations de Retrait */}
          <Link
            to="/withdraw-info"
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-900 text-sm font-black block">Informations de Retrait</span>
                <span className="text-slate-500 text-xs font-medium">Moyen de réception, numéro & titulaire</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>

          {/* Groupe Telegram Officiel */}
          <a
            href={groupLink || 'https://t.me/+5i6UubrC1mtmMDg0'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-900 text-sm font-black block">Canal Officiel</span>
                <span className="text-slate-500 text-xs font-medium">Communauté Telegram AgriTrans</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
          </a>

          {/* Télécharger l'Application */}
          <button
            onClick={handleInstallApp}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-900 text-sm font-black block">Télécharger l’application</span>
                <span className="text-slate-500 text-xs font-medium">Application mobile</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
              PWA
            </span>
          </button>

          {/* Se Déconnecter */}
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between text-left shadow-sm hover:bg-red-50/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="text-red-700 text-sm font-black block">Se déconnecter</span>
                <span className="text-slate-500 text-xs font-medium">Fermer votre session en toute sécurité</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 shrink-0" />
          </button>
        </div>

      </div>

      {/* Modal Guide Télécharger l'application */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Installer AgriTrans</h3>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Profitez d’une expérience fluide et rapide en installant l’application AgriTrans directement sur votre écran d’accueil :
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>Sur Android (Google Chrome) :</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Appuyez sur le menu (<strong>⋮</strong> en haut à droite), puis sélectionnez <strong>« Installer l’application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>🍎</span>
                  <span>Sur iPhone / iPad (Safari) :</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Appuyez sur le bouton de partage (<strong>⎋</strong> en bas), puis faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              J’ai compris
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Welcome Modal on Login */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        userName={user?.first_name || user?.phone || 'Partenaire'}
        telegramLink={groupLink}
      />

      {/* Floating Customer Support Button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={handleSupportRedirect}
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer p-1"
          title="Assistance 24/7"
          aria-label="Assistance Client AgriTrans"
        >
          <div className="w-full h-full rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <PhoneCall className="w-5 h-5" />
          </div>

          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      </div>
    </div>
  );
}
