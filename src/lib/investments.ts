import { supabase } from './supabase';
import { parseSafeDate } from './utils';
import { TransportPlan, DEFAULT_TRANSPORT_PLANS } from '../data/plans';
import { useAuthStore, saveStoredLocalUser } from '../store/useAuthStore';
import { saveLocalInvestment, saveLocalTransaction } from './dataStore';

export const CYCLE_24H_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Returns transport fleet details (name, photo, daily yield, duration) matching an investment.
 */
export function getCropInfo(planAmount: number | string, dailyYield?: number | string): TransportPlan {
  const amount = Number(planAmount) || 0;
  const daily = Number(dailyYield) || 0;

  // 1. Try to find in cache or database settings
  try {
    const cachedPlans = localStorage.getItem('agritrans_investment_plans') || localStorage.getItem('translogis_investment_plans');
    if (cachedPlans) {
      const parsed: TransportPlan[] = JSON.parse(cachedPlans);
      const match = parsed.find(p => Number(p.amount) === amount);
      if (match) return match;
    }
  } catch (e) {
    // Ignore JSON error and fallback
  }

  // 2. Try to match by exact amount in default transport plans
  const foundByAmount = DEFAULT_TRANSPORT_PLANS.find(p => Number(p.amount) === amount);
  if (foundByAmount) return foundByAmount;

  // 3. Try to match by daily yield
  if (daily > 0) {
    const foundByDaily = DEFAULT_TRANSPORT_PLANS.find(p => Number(p.daily) === daily);
    if (foundByDaily) return foundByDaily;
  }

  // 4. Clean fallback for custom or modified plans
  return {
    id: `transport-${amount}`,
    name: `Service Transport (${amount.toLocaleString('fr-FR')} FCFA)`,
    amount: amount,
    daily: daily || Math.round(amount * 0.07),
    total: (daily || Math.round(amount * 0.07)) * 60,
    duration: 60,
    image: DEFAULT_TRANSPORT_PLANS[0]?.image || '',
    locked: false
  };
}

export interface CultureTimerState {
  crop: TransportPlan;
  startDateMs: number;
  lastPaidMs: number;
  endDateMs: number;
  nextPayoutMs: number;
  timeLeftMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  isReady: boolean;
  claimableAmount: number;
  isCompleted: boolean;
  daysElapsed: number;
  totalDays: number;
}

export type TransportTimerState = CultureTimerState;

/**
 * Calculates countdown timer and claim eligibility for a transport investment.
 */
export function calculateCultureTimer(inv: any, nowMs: number = Date.now()): CultureTimerState {
  const planAmount = Number(inv.plan_amount || 0);
  const dailyYield = Number(inv.daily_yield || 0);
  const crop = getCropInfo(planAmount, dailyYield);

  const startDateMs = parseSafeDate(inv.start_date || inv.created_at);
  const lastPaidMs = inv.last_paid_at ? parseSafeDate(inv.last_paid_at) : startDateMs;
  const totalDays = crop.duration || 60;
  const endDateMs = inv.end_date ? parseSafeDate(inv.end_date) : startDateMs + totalDays * CYCLE_24H_MS;

  const isCompleted = inv.status === 'completed' || nowMs >= endDateMs;

  let nextPayoutMs = lastPaidMs + CYCLE_24H_MS;
  if (isCompleted) {
    nextPayoutMs = endDateMs;
  }

  const timeLeftMs = Math.max(0, nextPayoutMs - nowMs);
  const isReady = !isCompleted && timeLeftMs === 0;

  const totalCycleMs = CYCLE_24H_MS;
  const elapsedInCycleMs = Math.min(totalCycleMs, Math.max(0, nowMs - lastPaidMs));
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round((elapsedInCycleMs / totalCycleMs) * 100));

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const totalDurationMs = endDateMs - startDateMs;
  const totalElapsedMs = Math.max(0, nowMs - startDateMs);
  const daysElapsed = Math.min(totalDays, Math.floor(totalElapsedMs / CYCLE_24H_MS) + 1);

  // Calcul équitable des cycles de gains prêts à être perçus si l'utilisateur n'a pas réclamé immédiatement
  const cyclesElapsed = Math.max(1, Math.floor((nowMs - lastPaidMs) / CYCLE_24H_MS));
  const remainingDays = Math.max(1, Math.ceil((endDateMs - lastPaidMs) / CYCLE_24H_MS));
  const claimableCycles = Math.min(cyclesElapsed, remainingDays);
  const claimableAmount = isReady ? (dailyYield || crop.daily) * claimableCycles : 0;

  return {
    crop,
    startDateMs,
    lastPaidMs,
    endDateMs,
    nextPayoutMs,
    timeLeftMs,
    hours,
    minutes,
    seconds,
    progressPercent,
    isReady,
    claimableAmount,
    isCompleted,
    daysElapsed,
    totalDays
  };
}

export const calculateTransportTimer = calculateCultureTimer;

/**
 * Claims the daily yield for a specific transport service.
 */
export async function claimCultureYield(inv: any, userId: string): Promise<{ success: boolean; amount: number; message: string }> {
  try {
    const nowMs = Date.now();
    const timerState = calculateCultureTimer(inv, nowMs);

    if (!timerState.isReady) {
      return {
        success: false,
        amount: 0,
        message: `Ce véhicule est actuellement en transit. Prochain revenu dans ${timerState.hours}h ${timerState.minutes}m ${timerState.seconds}s.`
      };
    }

    const yieldAmount = timerState.claimableAmount;
    if (yieldAmount <= 0) {
      return { success: false, amount: 0, message: 'Aucun revenu disponible à percevoir.' };
    }

    // 1. Déterminer le solde actuel (local ou base distante)
    let currentBalance = Number(useAuthStore.getState().user?.balance || 0);
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .maybeSingle();
      if (dbUser && dbUser.balance !== undefined) {
        currentBalance = Number(dbUser.balance || 0);
      }
    } catch (e) {}

    const newBalance = currentBalance + yieldAmount;

    // Calcul précis du cycle validé
    const cyclesElapsed = Math.max(1, Math.floor((nowMs - timerState.lastPaidMs) / CYCLE_24H_MS));
    const remainingDays = Math.max(1, Math.ceil((timerState.endDateMs - timerState.lastPaidMs) / CYCLE_24H_MS));
    const claimedCycles = Math.min(cyclesElapsed, remainingDays);
    const newLastPaidMs = timerState.lastPaidMs + claimedCycles * CYCLE_24H_MS;
    const isNowFinished = newLastPaidMs >= timerState.endDateMs || (nowMs >= timerState.endDateMs);
    const newLastPaidIso = new Date(Math.min(nowMs, newLastPaidMs)).toISOString();
    const nowIso = new Date(nowMs).toISOString();

    // 2. Mise à jour locale immédiate du solde
    useAuthStore.getState().updateBalance(newBalance);
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      saveStoredLocalUser({ ...currentUser, balance: newBalance });
    }

    // Mise à jour API serveur du solde
    try {
      fetch(`/api/users/${userId}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      }).catch(() => {});
    } catch (e) {}

    // 3. Mise à jour locale immédiate de l'investissement
    saveLocalInvestment({
      ...inv,
      last_paid_at: newLastPaidIso,
      status: isNowFinished ? 'completed' : 'active'
    });

    // 4. Enregistrement local immédiat de la transaction
    const txId = 'tx_gain_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const gainRef = claimedCycles > 1 
      ? `Rendement cumulé (${claimedCycles}j) - ${timerState.crop.name}`
      : `Rendement - ${timerState.crop.name} (Service actif)`;

    saveLocalTransaction({
      id: txId,
      user_id: userId,
      type: 'daily_gain',
      amount: yieldAmount,
      status: 'completed',
      reference: gainRef,
      created_at: nowIso
    });

    // 5. Synchronisation avec le serveur interne et tâche de fond Supabase
    try {
      fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inv,
          last_paid_at: newLastPaidIso,
          status: isNowFinished ? 'completed' : 'active'
        })
      }).catch(() => {});

      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: txId,
          user_id: userId,
          type: 'daily_gain',
          amount: yieldAmount,
          status: 'completed',
          reference: gainRef,
          created_at: nowIso
        })
      }).catch(() => {});
    } catch (e) {}

    // Synchronisation distante Supabase discrète
    Promise.resolve(
      supabase.from('investments').update({
        last_paid_at: newLastPaidIso,
        status: isNowFinished ? 'completed' : 'active'
      }).eq('id', inv.id)
    ).catch(() => {});

    return {
      success: true,
      amount: yieldAmount,
      message: `Revenu de ${yieldAmount.toLocaleString('fr-FR')} FCFA perçu avec succès !`
    };
  } catch (error: any) {
    console.error('Erreur lors de la perception du revenu:', error);
    return {
      success: false,
      amount: 0,
      message: error?.message || 'Une erreur est survenue lors de la perception.'
    };
  }
}

export const claimTransportYield = claimCultureYield;

/**
 * Claims yields for ALL active services that have completed their 24h cycle.
 */
export async function claimAllActiveYields(investments: any[], userId: string): Promise<{ success: boolean; totalClaimed: number; count: number }> {
  let totalClaimed = 0;
  let count = 0;

  for (const inv of investments) {
    const timer = calculateCultureTimer(inv);
    if (timer.isReady && timer.claimableAmount > 0) {
      const res = await claimCultureYield(inv, userId);
      if (res.success) {
        totalClaimed += res.amount;
        count++;
      }
    }
  }

  return {
    success: count > 0,
    totalClaimed,
    count
  };
}
