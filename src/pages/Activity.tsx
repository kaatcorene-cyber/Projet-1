import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { 
  Clock, 
  Truck, 
  TrendingUp, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Activity as ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';
import { 
  calculateCultureTimer, 
  claimCultureYield, 
  claimAllActiveYields,
  CultureTimerState 
} from '../lib/investments';
import { getLocalInvestments } from '../lib/dataStore';

interface TransportCardProps {
  key?: any;
  investment: any;
  now: number;
  onClaim: (inv: any) => Promise<void>;
  isClaiming: boolean;
}

function TransportCard({ 
  investment, 
  now, 
  onClaim, 
  isClaiming 
}: TransportCardProps) {
  const timer: CultureTimerState = calculateCultureTimer(investment, now);
  const { crop, hours, minutes, seconds, progressPercent, isReady, claimableAmount, daysElapsed, totalDays } = timer;

  const nextPayoutDate = new Date(timer.nextPayoutMs);
  const formattedNextPayout = nextPayoutDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
      isReady 
        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Header: Vehicle thumbnail, Name, Days, and Status Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
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
                <Truck className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">
              {crop.name}
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              Jour <span className="font-black text-slate-900">{daysElapsed}</span>/{totalDays} • Formule <span className="text-emerald-700 font-black">{formatCurrency(investment.plan_amount)}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isReady ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full animate-pulse shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Prêt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En route
            </span>
          )}
        </div>
      </div>

      {/* Countdown Timer Block */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {isReady ? 'Revenu disponible' : 'Prochaine distribution'}
          </p>
          {isReady ? (
            <p className="text-base sm:text-lg font-black text-emerald-700">
              +{formatCurrency(claimableAmount)}
            </p>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {String(hours).padStart(2, '0')}h
              </span>
              <span className="text-slate-400 font-bold">:</span>
              <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {String(minutes).padStart(2, '0')}m
              </span>
              <span className="text-slate-400 font-bold">:</span>
              <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {String(seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>

        {/* Action Button: Percevoir (when ready) OR Progress % (when counting down) */}
        <div>
          {isReady ? (
            <button
              onClick={() => onClaim(investment)}
              disabled={isClaiming}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isClaiming ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Percevoir</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="text-right">
              <span className="text-xs font-black text-slate-800">{progressPercent}%</span>
              <p className="text-[10px] text-slate-500 font-medium">Cycle 24h</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 border border-slate-200">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            isReady 
              ? 'bg-emerald-500' 
              : 'bg-emerald-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!isReady && (
        <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-medium">
          <span>Revenu journalier : <strong className="text-emerald-700">{formatCurrency(investment.daily_yield || crop.daily)}</strong></span>
          <span>Versement à {formattedNextPayout}</span>
        </div>
      )}
    </div>
  );
}

export function Activity() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { investmentsCache, setInvestmentsCache } = useAppStore();
  const [investments, setInvestments] = useState<any[]>(() => investmentsCache || []);
  const [loading, setLoading] = useState(!investmentsCache);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const fetchInvestments = useCallback(async (showLoader = false) => {
    if (!user) return;
    if (showLoader) setLoading(true);

    try {
      const localInvs = getLocalInvestments(user.id);
      let remoteInvs: any[] = [];

      try {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (!error && data) {
          remoteInvs = data;
        }
      } catch (remErr) {}

      // Fusionner sans doublons (id)
      const invMap = new Map<string, any>();
      localInvs.forEach(i => invMap.set(i.id, i));
      remoteInvs.forEach(i => invMap.set(i.id, i));

      const merged = Array.from(invMap.values()).sort(
        (a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
      );

      setInvestments(merged);
      setInvestmentsCache(merged);
    } catch (e: any) {
      console.error('Fetch investments error:', e);
      const fallbackLocal = getLocalInvestments(user.id);
      if (fallbackLocal.length > 0) {
        setInvestments(fallbackLocal);
        setInvestmentsCache(fallbackLocal);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [user, setInvestmentsCache]);

  useEffect(() => {
    fetchInvestments();
    const interval = setInterval(() => {
      fetchInvestments(false);
    }, 15000);

    const onUpdated = () => fetchInvestments(false);
    window.addEventListener('agritrans_inv_updated', onUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('agritrans_inv_updated', onUpdated);
    };
  }, [fetchInvestments]);

  const handleClaimSingle = async (inv: any) => {
    if (!user || claimingId) return;
    setClaimingId(inv.id);
    setFeedback(null);

    try {
      const result = await claimCultureYield(inv, user.id);
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `+${formatCurrency(result.amount)} perçus avec succès sur votre solde !`
        });
        await useAuthStore.getState().refreshUser();
        await fetchInvestments(false);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || "Impossible d'encaisser pour le moment."
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || "Erreur lors de l'encaissement."
      });
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimAll = async () => {
    if (!user || claimingAll) return;
    setClaimingAll(true);
    setFeedback(null);

    try {
      const result = await claimAllActiveYields(investments, user.id);
      if (result.success && result.totalClaimed > 0) {
        setFeedback({
          type: 'success',
          message: `Félicitations ! +${formatCurrency(result.totalClaimed)} perçus sur ${result.count} véhicule(s).`
        });
        await useAuthStore.getState().refreshUser();
        await fetchInvestments(false);
      } else {
        setFeedback({
          type: 'error',
          message: "Aucun véhicule n'est encore prêt à être encaissé."
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || "Erreur lors de l'encaissement groupé."
      });
    } finally {
      setClaimingAll(false);
    }
  };

  const activeInvestments = investments.filter(i => i.status === 'active');
  const completedInvestments = investments.filter(i => i.status === 'completed');

  const claimableCount = activeInvestments.filter(i => {
    const t = calculateCultureTimer(i, now);
    return t.isReady;
  }).length;

  const totalClaimableReady = activeInvestments.reduce((sum, inv) => {
    const t = calculateCultureTimer(inv, now);
    return t.isReady ? sum + t.claimableAmount : sum;
  }, 0);

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Mes Flottes actifs</h1>
            <p className="text-[11px] font-medium text-slate-500">
              {activeInvestments.length} Véhicule(s) en service
            </p>
          </div>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-xl mx-auto space-y-4 px-3 sm:px-0">
        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200 shadow-sm ${
            feedback.type === 'success' 
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-950' 
              : 'bg-red-50 border border-red-300 text-red-900'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="flex-1">{feedback.message}</p>
          </div>
        )}

        {/* Overview Stat Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Véhicules en Opération
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {activeInvestments.length} actif{activeInvestments.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Rendement Journalier Cumulé
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              +{formatCurrency(activeInvestments.reduce((sum, inv) => sum + Number(inv.daily_yield || 0), 0))}
            </p>
          </div>
        </div>

        {/* Claim All Banner */}
        {claimableCount > 0 && (
          <div className="bg-emerald-700 rounded-2xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
                  {claimableCount} distribution(s) disponible(s)
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-black mt-0.5 text-white">
                +{formatCurrency(totalClaimableReady)}
              </p>
            </div>

            <button
              onClick={handleClaimAll}
              disabled={claimingAll || !!claimingId}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-900 text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {claimingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
              ) : (
                <>
                  <span>Tout percevoir</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Active Fleet List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Flotte en cours ({activeInvestments.length})
            </h2>
            <button
              onClick={() => fetchInvestments(true)}
              className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Actualiser
            </button>
          </div>

          {activeInvestments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Aucun véhicule en cours d'exploitation
              </h3>
            </div>
          ) : (
            activeInvestments.map((inv) => (
              <TransportCard
                key={inv.id}
                investment={inv}
                now={now}
                onClaim={handleClaimSingle}
                isClaiming={claimingId === inv.id}
              />
            ))
          )}
        </div>

        {/* Completed Vehicles */}
        {completedInvestments.length > 0 && (
          <div className="space-y-2.5 pt-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Cycles Terminés ({completedInvestments.length})
            </h2>
            <div className="space-y-2">
              {completedInvestments.map(inv => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">
                      Transport ({formatCurrency(inv.plan_amount)})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200">
                    Cycle 60 jours achevé
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
