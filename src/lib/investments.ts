import { supabase } from './supabase';
import { parseSafeDate } from './utils';
import { CropPlan, DEFAULT_CROP_PLANS } from '../data/plans';
import { useAuthStore } from '../store/useAuthStore';

export const CYCLE_24H_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Returns crop details (name, photo, daily yield, duration) matching an investment.
 */
export function getCropInfo(planAmount: number | string, dailyYield?: number | string): CropPlan {
  const amount = Number(planAmount) || 0;
  const daily = Number(dailyYield) || 0;

  // 1. Try to find in cache or database settings
  try {
    const cachedPlans = localStorage.getItem('cargill_investment_plans');
    if (cachedPlans) {
      const parsed: CropPlan[] = JSON.parse(cachedPlans);
      const match = parsed.find(p => Number(p.amount) === amount);
      if (match) return match;
    }
  } catch (e) {
    // Ignore JSON error and fallback
  }

  // 2. Try to match by exact amount in default crop plans
  const foundByAmount = DEFAULT_CROP_PLANS.find(p => Number(p.amount) === amount);
  if (foundByAmount) return foundByAmount;

  // 3. Try to match by daily yield
  if (daily > 0) {
    const foundByDaily = DEFAULT_CROP_PLANS.find(p => Number(p.daily) === daily);
    if (foundByDaily) return foundByDaily;
  }

  // 4. Clean fallback for custom or modified plans
  return {
    id: `crop-${amount}`,
    name: `Culture (${amount.toLocaleString('fr-FR')} FCFA)`,
    amount: amount,
    daily: daily || Math.round(amount * 0.07),
    total: (daily || Math.round(amount * 0.07)) * 60,
    duration: 60,
    image: DEFAULT_CROP_PLANS[0]?.image || '',
    locked: false
  };
}

export interface CultureTimerState {
  crop: CropPlan;
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
  cyclesReady: number;
  claimableAmount: number;
  daysElapsed: number;
  totalDays: number;
  isExpired: boolean;
}

/**
 * Computes the exact 24-hour cycle state and countdown for an individual investment.
 */
export function calculateCultureTimer(inv: any, nowMs: number = Date.now()): CultureTimerState {
  const crop = getCropInfo(inv.plan_amount, inv.daily_yield);
  const dailyYield = Number(inv.daily_yield) || Number(crop.daily) || 0;

  const startDateMs = parseSafeDate(inv.start_date || inv.created_at || nowMs);
  const lastPaidMs = parseSafeDate(inv.last_paid_at || inv.start_date || nowMs);
  const endDateMs = parseSafeDate(inv.end_date || (startDateMs + (crop.duration || 60) * CYCLE_24H_MS));

  const isExpired = nowMs >= endDateMs;
  const nextPayoutMs = lastPaidMs + CYCLE_24H_MS;

  const totalDays = Math.max(1, Math.round((endDateMs - startDateMs) / CYCLE_24H_MS)) || (crop.duration || 60);
  const daysElapsed = Math.min(totalDays, Math.max(1, Math.floor((nowMs - startDateMs) / CYCLE_24H_MS) + 1));

  if (nowMs >= nextPayoutMs) {
    // 24h cycle has arrived or passed!
    const cyclesReady = Math.max(1, Math.floor((nowMs - lastPaidMs) / CYCLE_24H_MS));
    const claimableAmount = cyclesReady * dailyYield;

    return {
      crop,
      startDateMs,
      lastPaidMs,
      endDateMs,
      nextPayoutMs,
      timeLeftMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 100,
      isReady: true,
      cyclesReady,
      claimableAmount,
      daysElapsed,
      totalDays,
      isExpired
    };
  } else {
    // 24h cycle is actively counting down
    const timeLeftMs = Math.max(0, nextPayoutMs - nowMs);
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    const elapsedInCycle = CYCLE_24H_MS - timeLeftMs;
    const progressPercent = Math.min(100, Math.max(0, (elapsedInCycle / CYCLE_24H_MS) * 100));

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
      isReady: false,
      cyclesReady: 0,
      claimableAmount: 0,
      daysElapsed,
      totalDays,
      isExpired
    };
  }
}

/**
 * Claims the daily yield for a specific culture.
 * Adds funds to user balance, logs transaction, and updates investment last_paid_at.
 */
export async function claimCultureYield(inv: any, userId: string): Promise<{ success: boolean; amount: number; message: string }> {
  try {
    const nowMs = Date.now();
    const timerState = calculateCultureTimer(inv, nowMs);

    if (!timerState.isReady || timerState.claimableAmount <= 0) {
      return { success: false, amount: 0, message: 'Le compte à rebours de 24h n\'est pas encore terminé.' };
    }

    // 1. Fetch live user balance
    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userErr || !userRecord) {
      throw new Error('Impossible de synchroniser avec le compte utilisateur.');
    }

    const currentBalance = Number(userRecord.balance) || 0;
    const newBalance = currentBalance + timerState.claimableAmount;

    // 2. Update user balance
    const { error: balanceErr } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceErr) throw balanceErr;

    // 3. Calculate new last_paid_at keeping exact 24h cadence
    const newLastPaidMs = timerState.lastPaidMs + (timerState.cyclesReady * CYCLE_24H_MS);
    const newLastPaidIso = new Date(newLastPaidMs).toISOString();

    const updatePayload: any = {
      last_paid_at: newLastPaidIso
    };

    if (nowMs >= timerState.endDateMs) {
      updatePayload.status = 'completed';
    }

    const { error: invErr } = await supabase
      .from('investments')
      .update(updatePayload)
      .eq('id', inv.id);

    if (invErr) throw invErr;

    // 4. Log transactions for each cycle claimed
    const transactionsToInsert = [];
    for (let i = 0; i < timerState.cyclesReady; i++) {
      transactionsToInsert.push({
        user_id: userId,
        type: 'daily_gain',
        amount: Number(inv.daily_yield) || timerState.crop.daily,
        status: 'completed',
        reference: inv.id
      });
    }

    if (transactionsToInsert.length > 0) {
      await supabase.from('transactions').insert(transactionsToInsert);
    }

    // 5. Update local store user
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.id === userId) {
      useAuthStore.getState().setUser({
        ...currentUser,
        balance: newBalance
      });
    }

    return {
      success: true,
      amount: timerState.claimableAmount,
      message: `Récolte réussie ! +${timerState.claimableAmount.toLocaleString('fr-FR')} FCFA ajoutés à votre solde.`
    };
  } catch (error: any) {
    console.error('Erreur lors de la récolte de culture:', error);
    return {
      success: false,
      amount: 0,
      message: error?.message || 'Une erreur est survenue lors de la récolte.'
    };
  }
}

/**
 * Claims yields for ALL active cultures that have completed their 24h cycle.
 */
export async function claimAllActiveYields(activeInvestments: any[], userId: string): Promise<{ success: boolean; totalAmount: number; count: number }> {
  let totalClaimed = 0;
  let countClaimed = 0;

  for (const inv of activeInvestments) {
    const timer = calculateCultureTimer(inv);
    if (timer.isReady && timer.claimableAmount > 0) {
      const res = await claimCultureYield(inv, userId);
      if (res.success) {
        totalClaimed += res.amount;
        countClaimed += 1;
      }
    }
  }

  return {
    success: countClaimed > 0,
    totalAmount: totalClaimed,
    count: countClaimed
  };
}
