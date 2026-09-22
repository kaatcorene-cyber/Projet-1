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
  balance: 150000,
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
  wave_number: '0574738155',
  ussd_ci: '*155*1*1*0140814162#',
  ussd_mtn_ci: '*133*1*1*0595918513#',
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

// Auto-nettoyage immédiat au chargement de l'application
if (typeof window !== 'undefined') {
  const PURGE_FLAG = 'agritrans_purge_all_except_admin_2026_done';
  if (safeStorage.getItem(PURGE_FLAG) !== 'true') {
    safeStorage.setItem(PURGE_FLAG, 'true');
    // Réinitialisation locale immédiate et synchrone
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([SEED_ADMIN]));
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify([]));
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify([]));

    // Déconnexion d'un éventuel compte non-admin
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

    // Nettoyage en arrière-plan Supabase
    setTimeout(() => {
      purgePlatformDataExceptAdmin().catch(() => {});
    }, 100);
  }
}
