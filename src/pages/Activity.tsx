import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { 
  Clock, 
  Sprout, 
  TrendingUp, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';
import { 
  calculateCultureTimer, 
  claimCultureYield, 
  claimAllActiveYields,
  CultureTimerState 
} from '../lib/investments';

interface CultureCardProps {
  key?: any;
  investment: any;
  now: number;
  onClaim: (inv: any) => Promise<void>;
  isClaiming: boolean;
}

function CultureCard({ 
  investment, 
  now, 
  onClaim, 
  isClaiming 
}: CultureCardProps) {
  const timer: CultureTimerState = calculateCultureTimer(investment, now);
  const { crop, hours, minutes, seconds, progressPercent, isReady, claimableAmount, daysElapsed, totalDays } = timer;

  const nextPayoutDate = new Date(timer.nextPayoutMs);
  const formattedNextPayout = nextPayoutDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`bg-white rounded-2xl p-3.5 border transition-all duration-200 shadow-2xs ${
      isReady 
        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 bg-emerald-50/15' 
        : 'border-black/5 hover:border-black/10'
    }`}>
      {/* Header: Crop thumbnail, Name, Days, and Status Badge */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-600/15 shrink-0">
            {crop.image ? (
              <img 
                src={crop.image} 
                alt={crop.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-600">
                <Sprout className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-gray-900 text-sm leading-tight truncate">
              {crop.name}
            </h3>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              Jour {daysElapsed}/{totalDays} • Capital : <span className="font-bold text-gray-700">{formatCurrency(investment.plan_amount || crop.amount)}</span>
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isReady ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs animate-pulse">
              <Sparkles className="w-3 h-3" />
              Prêt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              En cours
            </span>
          )}
        </div>
      </div>

      {/* 24h Countdown & Yield Row */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none">
              Compte 24h
            </span>
            <div className="font-mono text-xs sm:text-sm font-black text-gray-900 tracking-wider mt-0.5">
              {isReady ? (
                <span className="text-emerald-600 font-bold">Cycle terminé</span>
              ) : (
                <span>
                  {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none">
            Gain journalier
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 block">
            +{formatCurrency(investment.daily_yield || crop.daily)}
          </span>
        </div>
      </div>

      {/* Thin Progress bar */}
      <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Action Button: harvest if ready */}
      {isReady ? (
        <button
          onClick={() => onClaim(investment)}
          disabled={isClaiming}
          className="w-full mt-2.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isClaiming ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          )}
          <span>Récolter le gain ({formatCurrency(claimableAmount)})</span>
        </button>
      ) : (
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-medium px-0.5">
          <span>Versement automatique chaque 24h</span>
          <span>Échéance ~ {formattedNextPayout}</span>
        </div>
      )}
    </div>
  );
}

export function Activity() {
  const { user, refreshUser } = useAuthStore();
  const { investmentsCache, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();

  const [activeInvestments, setActiveInvestments] = useState<any[]>(investmentsCache || []);
  const [completedInvestments, setCompletedInvestments] = useState<any[]>([]);
  const [dailyGain, setDailyGain] = useState(0);
  const [isLoading, setIsLoading] = useState(!investmentsCache);
  const [now, setNow] = useState<number>(Date.now());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Real-time second tick for all individual culture countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch both active and completed investments
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('start_date', { ascending: false });

      if (!error && data) {
        const active = data.filter(inv => inv.status === 'active');
        const completed = data.filter(inv => inv.status === 'completed');

        setActiveInvestments(active);
        setCompletedInvestments(completed);
        setInvestmentsCache(active);

        const total = active.reduce((acc: number, curr: any) => acc + Number(curr.daily_yield || 0), 0);
        setDailyGain(total);
      }
    } catch (err) {
      console.error('Erreur de chargement des cultures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setInvestmentsCache]);

  useEffect(() => {
    refreshUser();
    fetchData();

    // Periodic sync with server every 30 seconds
    const intervalId = setInterval(() => {
      fetchData();
      refreshUser();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData, refreshUser]);

  // Handle single culture harvest
  const handleClaim = async (investment: any) => {
    if (!user || claimingId !== null) return;
    setClaimingId(investment.id);
    setNotification(null);

    try {
      const res = await claimCultureYield(investment, user.id);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        await refreshUser();
        await fetchData();
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e?.message || 'Erreur lors de la récolte' });
    } finally {
      setClaimingId(null);
    }
  };

  // Handle claim all available cultures at once
  const handleClaimAll = async () => {
    if (!user || isClaimingAll) return;
    setIsClaimingAll(true);
    setNotification(null);

    try {
      const res = await claimAllActiveYields(activeInvestments, user.id);
      if (res.success && res.totalAmount > 0) {
        setNotification({ 
          type: 'success', 
          message: `Récolte groupée réussie ! +${res.totalAmount.toLocaleString('fr-FR')} FCFA crédités sur votre solde.` 
        });
        await refreshUser();
        await fetchData();
      } else {
        setNotification({ type: 'error', message: 'Aucun gain n\'est actuellement disponible pour la récolte.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e?.message || 'Erreur lors de la récolte groupée' });
    } finally {
      setIsClaimingAll(false);
    }
  };

  // Calculate total claimable amount ready across all active cultures
  const totalClaimable = activeInvestments.reduce((sum, inv) => {
    const timer = calculateCultureTimer(inv, now);
    return sum + (timer.isReady ? timer.claimableAmount : 0);
  }, 0);

  const readyCount = activeInvestments.filter(inv => {
    const timer = calculateCultureTimer(inv, now);
    return timer.isReady;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <p className="absolute mt-16 text-emerald-600 font-bold animate-pulse text-xs">
          Synchronisation de vos cultures...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-gray-900 relative overflow-x-hidden">
      {/* Ambient background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="relative z-10 px-5 pt-6 max-w-xl mx-auto">
        {/* Top bar with navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-xs font-black text-gray-600 hover:text-emerald-700 bg-white border border-black/5 px-3 py-1.5 rounded-full shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Mon Compte</span>
          </button>
          <AppLogo imgClassName="h-7 w-auto object-contain" />
        </div>

        {/* Page Title & Status */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">
                Suivi des Cultures
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-400 bg-white px-2.5 py-0.5 rounded-full border border-black/5">
              Sync en direct
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Activité & Récoltes</h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">
            Chaque culture dispose de son propre compte à rebours de 24h.
          </p>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl mb-5 flex items-start gap-3 border shadow-sm transition-all ${
            notification.type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50/90 border-rose-200 text-rose-900'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-bold leading-relaxed">
              {notification.message}
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary Stats Bar (Chic & Compact) */}
        <div className="bg-white rounded-2xl p-3 border border-black/5 flex items-center justify-between divide-x divide-gray-100 shadow-2xs mb-4">
          <div className="flex-1 pr-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                Rendement / 24h
              </span>
              <span className="text-sm font-black text-emerald-600 tracking-tight mt-0.5 block">
                {formatCurrency(dailyGain)}
              </span>
            </div>
          </div>

          <div className="flex-1 pl-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                Parcelles
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-black text-gray-900 tracking-tight">
                  {activeInvestments.length}
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">active{activeInvestments.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Claim All Banner (if at least one culture has completed its 24h cycle) */}
        {totalClaimable > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-3.5 text-white mb-4 shadow-sm flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                Récolte prête ({readyCount})
              </span>
              <p className="text-base font-black tracking-tight">
                +{formatCurrency(totalClaimable)}
              </p>
            </div>

            <button
              onClick={handleClaimAll}
              disabled={isClaimingAll}
              className="py-2 px-3.5 rounded-xl bg-white text-emerald-800 font-black text-xs shadow-sm hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isClaimingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>Tout récolter</span>
            </button>
          </div>
        )}

        {/* Liste des Cultures (Chaque culture avec son propre compte à rebours 24h) */}
        <div className="space-y-4">
          {activeInvestments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-black/5 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3.5">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1">
                Aucune culture en cours
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Lancez votre première culture dès 3 000 FCFA pour activer votre parcelle et percevoir vos rendements chaque 24h.
              </p>
              <button
                onClick={() => navigate('/invest')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Explorer les cultures disponibles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            activeInvestments.map(inv => (
              <CultureCard
                key={inv.id}
                investment={inv}
                now={now}
                onClaim={handleClaim}
                isClaiming={claimingId === inv.id}
              />
            ))
          )}

          {/* Cultures Terminées (affichées sobrement si présentes) */}
          {completedInvestments.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                Historique ({completedInvestments.length})
              </p>
              {completedInvestments.map(inv => (
                <div key={inv.id} className="bg-white rounded-2xl p-3.5 border border-black/5 opacity-75 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-800">
                      Culture ({formatCurrency(inv.plan_amount)})
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                      Cycle contractuel terminé avec succès
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                    Terminé
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
