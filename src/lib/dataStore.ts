import { safeStorage } from './storage';
import { supabase } from './supabase';
import { generatePhoneCandidates, User } from '../store/useAuthStore';
import { DEFAULT_CROP_PLANS, CropPlan } from '../data/plans';

export interface LocalTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  description?: string;
  created_at: string;
  users?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export interface LocalInvestment {
  id: string;
  user_id: string;
  plan_amount: number;
  daily_yield: number;
  start_date: string;
  end_date: string;
  last_paid_at: string;
  status: string;
  created_at?: string;
  users?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export interface AppSetting {
  id?: string;
  key: string;
  value: string;
  description?: string;
}

const LOCAL_USERS_KEY = 'agritrans_local_users';
const LOCAL_TX_KEY = 'agritrans_local_transactions';
const LOCAL_INV_KEY = 'agritrans_local_investments';
const LOCAL_SETTINGS_KEY = 'agritrans_local_settings';

export const SEED_ADMIN: User = {
  id: 'admin-seed-001',
  phone: '+2250704752133',
  country: "Côte d'Ivoire",
  first_name: 'Admin',
  last_name: 'AgriTrans',
  password_hash: 'Calmaress225@',
  role: 'admin',
  balance: 0,
  referral_code: 'AGRIADMIN',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString()
};

const SEED_USERS: User[] = [
  SEED_ADMIN
];

const SEED_TRANSACTIONS: LocalTransaction[] = [];

const SEED_INVESTMENTS: LocalInvestment[] = [];

const SEED_SETTINGS: Record<string, string> = {
  payment_link: 'https://payin.moneyfusion.net',
  support_link: 'https://wa.me/2250704752133',
  group_link: 'https://t.me/agritrans_officiel',
  telegram_link: 'https://t.me/agritrans_officiel',
  whatsapp_support: 'https://wa.me/2250704752133',
  app_logo: '/agritrans-logo.png'
};

// --- USERS ---
export function getLocalUsers(): User[] {
  try {
    const raw = safeStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Toujours s'assurer que l'admin existe
        if (!parsed.some(u => u.phone === SEED_ADMIN.phone || u.id === SEED_ADMIN.id)) {
          parsed.unshift(SEED_ADMIN);
          safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {}
  safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

export function saveLocalUser(user: User): void {
  try {
    const users = getLocalUsers();
    const idx = users.findIndex(u => 
      u.id === user.id || 
      u.phone === user.phone || 
      generatePhoneCandidates(u.phone).includes(user.phone)
    );
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.unshift(user);
    }
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('saveLocalUser error:', e);
  }
}

export function deleteLocalUser(userId: string): void {
  try {
    const users = getLocalUsers().filter(u => u.id !== userId);
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    
    // Supprimer également les transactions et investissements locaux liés
    deleteLocalTransactionsForUser(userId);
    deleteLocalInvestmentsForUser(userId);
  } catch (e) {}
}

// --- TRANSACTIONS ---
export function getLocalTransactions(userId?: string): LocalTransaction[] {
  try {
    const raw = safeStorage.getItem(LOCAL_TX_KEY);
    let list: LocalTransaction[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } else {
      list = SEED_TRANSACTIONS;
      safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(list));
    }
    if (userId) {
      return list.filter(t => t.user_id === userId);
    }
    return list;
  } catch (e) {
    return userId ? SEED_TRANSACTIONS.filter(t => t.user_id === userId) : SEED_TRANSACTIONS;
  }
}

export function getLocalTransactionsForUser(userId: string): LocalTransaction[] {
  return getLocalTransactions(userId);
}

export function saveLocalTransaction(tx: LocalTransaction): void {
  try {
    const list = getLocalTransactions();
    const idx = list.findIndex(t => t.id === tx.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...tx };
    } else {
      list.unshift(tx);
    }
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_tx_updated'));
    }
  } catch (e) {}
}

export function updateLocalTransactionStatus(txId: string, status: string): LocalTransaction | null {
  try {
    const list = getLocalTransactions();
    const idx = list.findIndex(t => t.id === txId);
    if (idx >= 0) {
      list[idx].status = status;
      safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('agritrans_tx_updated'));
      }
      return list[idx];
    }
  } catch (e) {}
  return null;
}

export function deleteLocalTransaction(txId: string): void {
  try {
    const list = getLocalTransactions().filter(t => t.id !== txId);
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_tx_updated'));
    }
  } catch (e) {}
}

export function deleteLocalTransactionsForUser(userId: string): void {
  try {
    const list = getLocalTransactions().filter(t => t.user_id !== userId);
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(list));
  } catch (e) {}
}

// --- INVESTMENTS ---
export function getLocalInvestments(userId?: string): LocalInvestment[] {
  try {
    const raw = safeStorage.getItem(LOCAL_INV_KEY);
    let list: LocalInvestment[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } else {
      list = SEED_INVESTMENTS;
      safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(list));
    }
    if (userId) {
      return list.filter(i => i.user_id === userId);
    }
    return list;
  } catch (e) {
    return userId ? SEED_INVESTMENTS.filter(i => i.user_id === userId) : SEED_INVESTMENTS;
  }
}

export function saveLocalInvestment(inv: LocalInvestment): void {
  try {
    const list = getLocalInvestments();
    const idx = list.findIndex(i => i.id === inv.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...inv };
    } else {
      list.unshift(inv);
    }
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_inv_updated'));
    }
  } catch (e) {}
}

export function deleteLocalInvestment(invId: string): void {
  try {
    const list = getLocalInvestments().filter(i => i.id !== invId);
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_inv_updated'));
    }
  } catch (e) {}
}

export function deleteLocalInvestmentsForUser(userId: string): void {
  try {
    const list = getLocalInvestments().filter(i => i.user_id !== userId);
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(list));
  } catch (e) {}
}

// --- SETTINGS ---
export function getLocalSettings(): Record<string, string> {
  try {
    const raw = safeStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...SEED_SETTINGS, ...parsed };
      }
    }
  } catch (e) {}
  return { ...SEED_SETTINGS };
}

export function saveLocalSettings(settings: Record<string, string>): void {
  try {
    const current = getLocalSettings();
    const merged = { ...current, ...settings };
    safeStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {}
}

/**
 * Supprime tous les comptes utilisateurs, toutes les transactions et tous les investissements
 * de la plateforme, en ne conservant STRICTEMENT que le compte Administrateur.
 */
export async function purgePlatformDataExceptAdmin(): Promise<{ usersDeleted: number; transactionsDeleted: number; investmentsDeleted: number }> {
  let usersDeleted = 0;
  let transactionsDeleted = 0;
  let investmentsDeleted = 0;

  // 1. Nettoyage LocalStorage
  try {
    const currentUsers = getLocalUsers();
    usersDeleted = Math.max(0, currentUsers.filter(u => u.role !== 'admin' && u.phone !== SEED_ADMIN.phone && u.id !== SEED_ADMIN.id).length);

    const currentTxs = getLocalTransactions();
    transactionsDeleted = currentTxs.length;

    const currentInvs = getLocalInvestments();
    investmentsDeleted = currentInvs.length;

    // Réinitialiser les utilisateurs avec UNIQUEMENT l'administrateur
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([SEED_ADMIN]));
    // Vider les transactions
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify([]));
    // Vider les investissements
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify([]));

    // Nettoyer tous les caches individuels, statistiques d'équipe et infos de retrait
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (
          k.startsWith('agritrans_team_stats') ||
          k.startsWith('agritrans_claimed_commissions') ||
          k.startsWith('agritrans_withdraw_info') ||
          k.startsWith('translogis_withdraw_info') ||
          k.startsWith('withdrawal_account') ||
          k.startsWith('agritrans_investments_cache') ||
          k.startsWith('agritrans_tx_cache') ||
          k.startsWith('agritrans_daily_collected_') ||
          k.startsWith('agritrans_tx_history_') ||
          k === 'agritrans_transactions_cache'
        )) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => safeStorage.removeItem(k));

      // Déconnecter la session active si ce n'est pas l'administrateur
      try {
        const authRaw = safeStorage.getItem('translogis-auth');
        if (authRaw) {
          const authData = JSON.parse(authRaw);
          const currentUser = authData?.state?.user;
          if (currentUser && currentUser.role !== 'admin' && currentUser.phone !== '+2250704752133' && currentUser.phone !== '0704752133') {
            safeStorage.removeItem('translogis-auth');
          }
        }
      } catch (e) {}

      // Émettre les événements pour mise à jour immédiate de tous les composants
      window.dispatchEvent(new Event('agritrans_tx_updated'));
      window.dispatchEvent(new Event('agritrans_inv_updated'));
      window.dispatchEvent(new Event('agritrans_user_updated'));
    }
  } catch (e) {
    console.warn('Erreur lors du nettoyage local:', e);
  }

  // 2. Nettoyage Distant Supabase (si connecté)
  try {
    await supabase.from('transactions').delete().gte('amount', 0);
  } catch (e) {}

  try {
    await supabase.from('investments').delete().gte('plan_amount', 0);
  } catch (e) {}

  try {
    await supabase.from('deposit_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {}

  try {
    // Retirer les liens de parrainage avant suppression
    await supabase.from('users').update({ referred_by: null }).neq('id', SEED_ADMIN.id);
    // Supprimer tous les utilisateurs non-admins
    await supabase.from('users').delete().neq('role', 'admin').neq('phone', '+2250704752133').neq('phone', '0704752133').neq('id', SEED_ADMIN.id);
  } catch (e) {}

  // 3. Garantir la présence de l'Administrateur sur Supabase
  try {
    await supabase.from('users').upsert({
      id: SEED_ADMIN.id,
      phone: SEED_ADMIN.phone,
      country: SEED_ADMIN.country,
      first_name: SEED_ADMIN.first_name,
      last_name: SEED_ADMIN.last_name,
      password_hash: SEED_ADMIN.password_hash,
      role: 'admin',
      balance: SEED_ADMIN.balance,
      referral_code: SEED_ADMIN.referral_code
    }, { onConflict: 'phone' });
  } catch (e) {}

  return { usersDeleted, transactionsDeleted, investmentsDeleted };
}

// Distribution des commissions de parrainage multi-niveaux (N1 20%, N2 2%, N3 1%)
export async function distributeInvestmentCommissions(investor: User, planAmount: number, planName: string): Promise<void> {
  if (!investor || !investor.referred_by || Number(planAmount) <= 0) return;

  const investorRef = investor.referred_by.trim();
  const localUsers = getLocalUsers();

  const findUserByRef = (refKey: string, list: User[]): User | undefined => {
    if (!refKey) return undefined;
    const clean = refKey.trim().toUpperCase();
    return list.find(u => 
      (u.referral_code && u.referral_code.toUpperCase() === clean) ||
      (u.id && u.id === refKey.trim()) ||
      (u.phone && (u.phone === refKey.trim() || generatePhoneCandidates(u.phone).includes(refKey.trim())))
    );
  };

  // 1. Niveau 1 (20%)
  const sponsor1 = findUserByRef(investorRef, localUsers);
  if (sponsor1) {
    const bonus1 = Math.round(Number(planAmount) * 0.20);
    const newBal1 = Math.max(0, Number(sponsor1.balance || 0)) + bonus1;
    sponsor1.balance = newBal1;
    saveLocalUser(sponsor1);

    saveLocalTransaction({
      id: `tx_bonus_l1_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: sponsor1.id,
      type: 'referral_bonus',
      amount: bonus1,
      status: 'completed',
      reference: `Commission Niveau 1 (20%) - ${investor.phone} (${planName})`,
      created_at: new Date().toISOString()
    });

    // 2. Niveau 2 (2%)
    if (sponsor1.referred_by) {
      const sponsor2 = findUserByRef(sponsor1.referred_by, localUsers);
      if (sponsor2 && sponsor2.id !== sponsor1.id && sponsor2.id !== investor.id) {
        const bonus2 = Math.round(Number(planAmount) * 0.02);
        const newBal2 = Math.max(0, Number(sponsor2.balance || 0)) + bonus2;
        sponsor2.balance = newBal2;
        saveLocalUser(sponsor2);

        saveLocalTransaction({
          id: `tx_bonus_l2_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: sponsor2.id,
          type: 'referral_bonus',
          amount: bonus2,
          status: 'completed',
          reference: `Commission Niveau 2 (2%) - ${investor.phone} (${planName})`,
          created_at: new Date().toISOString()
        });

        // 3. Niveau 3 (1%)
        if (sponsor2.referred_by) {
          const sponsor3 = findUserByRef(sponsor2.referred_by, localUsers);
          if (sponsor3 && sponsor3.id !== sponsor2.id && sponsor3.id !== sponsor1.id && sponsor3.id !== investor.id) {
            const bonus3 = Math.round(Number(planAmount) * 0.01);
            const newBal3 = Math.max(0, Number(sponsor3.balance || 0)) + bonus3;
            sponsor3.balance = newBal3;
            saveLocalUser(sponsor3);

            saveLocalTransaction({
              id: `tx_bonus_l3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              user_id: sponsor3.id,
              type: 'referral_bonus',
              amount: bonus3,
              status: 'completed',
              reference: `Commission Niveau 3 (1%) - ${investor.phone} (${planName})`,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_tx_updated'));
      window.dispatchEvent(new Event('agritrans_user_updated'));
    }
  }

  // Tâche de fond non bloquante : synchronisation Supabase
  try {
    const { data: dbSponsor1 } = await supabase
      .from('users')
      .select('id, balance, referral_code, referred_by')
      .or(`referral_code.ilike.${investorRef},id.eq.${investorRef}`)
      .maybeSingle();

    if (dbSponsor1) {
      const bonus1 = Math.round(Number(planAmount) * 0.20);
      await supabase.from('users').update({ balance: Math.max(0, Number(dbSponsor1.balance || 0)) + bonus1 }).eq('id', dbSponsor1.id);
      await supabase.from('transactions').insert([{
        user_id: dbSponsor1.id,
        type: 'referral_bonus',
        amount: bonus1,
        status: 'completed',
        reference: `Commission Niveau 1 (20%) - ${investor.phone} (${planName})`
      }]);

      if (dbSponsor1.referred_by) {
        const { data: dbSponsor2 } = await supabase
          .from('users')
          .select('id, balance, referral_code, referred_by')
          .or(`referral_code.ilike.${dbSponsor1.referred_by},id.eq.${dbSponsor1.referred_by}`)
          .maybeSingle();

        if (dbSponsor2) {
          const bonus2 = Math.round(Number(planAmount) * 0.02);
          await supabase.from('users').update({ balance: Math.max(0, Number(dbSponsor2.balance || 0)) + bonus2 }).eq('id', dbSponsor2.id);
          await supabase.from('transactions').insert([{
            user_id: dbSponsor2.id,
            type: 'referral_bonus',
            amount: bonus2,
            status: 'completed',
            reference: `Commission Niveau 2 (2%) - ${investor.phone} (${planName})`
          }]);

          if (dbSponsor2.referred_by) {
            const { data: dbSponsor3 } = await supabase
              .from('users')
              .select('id, balance, referral_code')
              .or(`referral_code.ilike.${dbSponsor2.referred_by},id.eq.${dbSponsor2.referred_by}`)
              .maybeSingle();

            if (dbSponsor3) {
              const bonus3 = Math.round(Number(planAmount) * 0.01);
              await supabase.from('users').update({ balance: Math.max(0, Number(dbSponsor3.balance || 0)) + bonus3 }).eq('id', dbSponsor3.id);
              await supabase.from('transactions').insert([{
                user_id: dbSponsor3.id,
                type: 'referral_bonus',
                amount: bonus3,
                status: 'completed',
                reference: `Commission Niveau 3 (1%) - ${investor.phone} (${planName})`
              }]);
            }
          }
        }
      }
    }
  } catch (e) {
    // Non bloquant si base distante inaccessible
  }
}

// Remise à zéro de tous les soldes utilisateurs
export function resetAllBalancesToZero(): void {
  try {
    const raw = safeStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const zeroUsers = parsed.map(u => ({ ...u, balance: 0 }));
        safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(zeroUsers));
      }
    }
    const authRaw = safeStorage.getItem('translogis-auth');
    if (authRaw) {
      const authData = JSON.parse(authRaw);
      if (authData?.state?.user) {
        authData.state.user.balance = 0;
        safeStorage.setItem('translogis-auth', JSON.stringify(authData));
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_user_updated'));
    }
  } catch (e) {}

  // Mise à zéro distante Supabase
  try {
    Promise.resolve(supabase.from('users').update({ balance: 0 }).gte('balance', 0)).catch(() => {});
  } catch (e) {}
}

// Exécution de la remise à zéro des soldes demandée par l'administrateur
if (typeof window !== 'undefined') {
  const ZERO_BALANCES_FLAG = 'agritrans_zero_balances_v1';
  if (safeStorage.getItem(ZERO_BALANCES_FLAG) !== 'true') {
    safeStorage.setItem(ZERO_BALANCES_FLAG, 'true');
    resetAllBalancesToZero();
  }
}
