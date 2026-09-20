import { supabase } from './supabase';
import { parseSafeDate } from './utils';
import { TransportPlan, DEFAULT_TRANSPORT_PLANS } from '../data/plans';
import { useAuthStore } from '../store/useAuthStore';

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

  const claimableAmount = isReady ? (dailyYield || crop.daily) : 0;

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

    // 1. Get fresh user balance
    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userErr || !dbUser) {
      throw new Error('Impossible de charger votre compte.');
    }

    const currentBalance = Number(dbUser.balance || 0);
    const newBalance = currentBalance + yieldAmount;

    // 2. Update user balance
    const { error: updateBalErr } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateBalErr) throw updateBalErr;

    // 3. Update investment last_paid_at to NOW
    const nowIso = new Date(nowMs).toISOString();
    const isNowFinished = nowMs >= timerState.endDateMs;

    const { error: updateInvErr } = await supabase
      .from('investments')
      .update({
        last_paid_at: nowIso,
        status: isNowFinished ? 'completed' : 'active'
      })
      .eq('id', inv.id);

    if (updateInvErr) throw updateInvErr;

    // 4. Record transaction in transactions table
    await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'daily_gain',
      amount: yieldAmount,
      status: 'completed',
      reference: `Rendement - ${timerState.crop.name} (Service actif)`
    }]);

    // 5. Update in-memory auth store balance
    useAuthStore.getState().updateBalance(newBalance);

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
