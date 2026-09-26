import { safeStorage } from './storage';
import { supabase } from './supabase';
import type { User } from '../store/useAuthStore';
import { DEFAULT_CROP_PLANS, CropPlan } from '../data/plans';
import { 
  generatePhoneCandidates, 
  isPermanentlyDeletedPhone, 
  BANNED_PHONES 
} from './phoneUtils';

export { generatePhoneCandidates, isPermanentlyDeletedPhone, BANNED_PHONES };

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
  last_name: 'ORLEN',
  password_hash: 'Calmaress225@',
  role: 'admin',
  balance: 0,
  referral_code: 'ORLENADMIN',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString()
};

export const SEED_ADMIN_2: User = {
  id: 'admin-seed-002',
  phone: '+2250700000000',
  country: "Côte d'Ivoire",
  first_name: 'Direction',
  last_name: 'ORLEN',
  password_hash: 'Calmaress225@',
  role: 'admin',
  balance: 0,
  referral_code: 'ORLEN000',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString()
};

const SEED_USERS: User[] = [
  SEED_ADMIN,
  SEED_ADMIN_2
];

const SEED_TRANSACTIONS: LocalTransaction[] = [];

const SEED_INVESTMENTS: LocalInvestment[] = [];

const SEED_SETTINGS: Record<string, string> = {
  payment_link: 'https://payin.moneyfusion.net',
  support_link: 'https://t.me/orlen_ci_support',
  group_link: 'https://t.me/orlen_ci_stations',
  telegram_link: 'https://t.me/orlen_ci_stations',
  whatsapp_support: 'https://t.me/orlen_ci_support',
  app_logo: '/logo.svg'
};

// Initialisation de la persistance locale sécurisée


// --- USERS ---
export function getLocalUsers(): User[] {
  try {
    const raw = safeStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filtrer les comptes de démonstration et les comptes supprimés
        const filtered = parsed.filter(u => 
          !isPermanentlyDeletedPhone(u.phone) &&
          !u.id.startsWith('usr-team-') &&
          u.referral_code !== 'AGRIKJ01' &&
          u.referral_code !== 'AGRIAK02' &&
          u.referral_code !== 'AGRIBM03' &&
          u.referral_code !== 'AGRITS04'
        );
        // Toujours s'assurer que l'admin existe
        if (!filtered.some(u => u.phone === SEED_ADMIN.phone || u.id === SEED_ADMIN.id)) {
          filtered.unshift(SEED_ADMIN);
        }
        if (filtered.length !== parsed.length) {
          safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));
        }
        return filtered;
      }
    }
  } catch (e) {}
  safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

export function saveLocalUser(user: User, shouldBroadcast = true, shouldSyncServer = true): void {
  if (isPermanentlyDeletedPhone(user.phone)) {
    return;
  }
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
    if (typeof window !== 'undefined') {
      if (shouldBroadcast) {
        window.dispatchEvent(new Event('agritrans_user_updated'));
      }
      if (shouldSyncServer) {
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('saveLocalUser error:', e);
  }
}

export function saveLocalUsersBatch(newUsers: User[]): void {
  if (!Array.isArray(newUsers) || newUsers.length === 0) return;
  try {
    const current = getLocalUsers();
    const map = new Map<string, User>();
    current.forEach(u => map.set(u.id, u));

    newUsers.forEach(u => {
      if (!isPermanentlyDeletedPhone(u.phone)) {
        const existing = map.get(u.id) || Array.from(map.values()).find(ex => ex.phone === u.phone);
        if (existing) {
          map.set(existing.id, { ...existing, ...u });
        } else {
          map.set(u.id, u);
        }
      }
    });

    const merged = Array.from(map.values());
    if (!merged.some(u => u.phone === SEED_ADMIN.phone || u.id === SEED_ADMIN.id)) {
      merged.unshift(SEED_ADMIN);
    }
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(merged));
  } catch (e) {}
}

export function deleteLocalUser(userId: string): void {
  try {
    const users = getLocalUsers().filter(u => u.id !== userId);
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    
    // Supprimer également les transactions et investissements locaux liés
    deleteLocalTransactionsForUser(userId);
    deleteLocalInvestmentsForUser(userId);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_user_updated'));
      fetch(`/api/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    }
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

export function saveLocalTransaction(tx: LocalTransaction, shouldBroadcast = true, shouldSyncServer = true): void {
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
      if (shouldBroadcast) {
        window.dispatchEvent(new Event('agritrans_tx_updated'));
      }
      if (shouldSyncServer) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx)
        }).catch(() => {});
      }
    }
  } catch (e) {}
}

export function saveLocalTransactionsBatch(newTxs: LocalTransaction[]): void {
  if (!Array.isArray(newTxs) || newTxs.length === 0) return;
  try {
    const current = getLocalTransactions();
    const map = new Map<string, LocalTransaction>();
    current.forEach(t => map.set(t.id, t));
    newTxs.forEach(t => map.set(t.id, { ...(map.get(t.id) || {}), ...t }));
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(Array.from(map.values())));
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
        fetch(`/api/transactions/${txId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).catch(() => {});
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

export function saveLocalInvestment(inv: LocalInvestment, shouldBroadcast = true, shouldSyncServer = true): void {
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
      if (shouldBroadcast) {
        window.dispatchEvent(new Event('agritrans_inv_updated'));
      }
      if (shouldSyncServer) {
        fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inv)
        }).catch(() => {});
      }
    }
  } catch (e) {}
}

export function saveLocalInvestmentsBatch(newInvs: LocalInvestment[]): void {
  if (!Array.isArray(newInvs) || newInvs.length === 0) return;
  try {
    const current = getLocalInvestments();
    const map = new Map<string, LocalInvestment>();
    current.forEach(i => map.set(i.id, i));
    newInvs.forEach(i => map.set(i.id, { ...(map.get(i.id) || {}), ...i }));
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(Array.from(map.values())));
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
    if (typeof window !== 'undefined') {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }).catch(() => {});
    }
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

  // 1. Purge via l'API serveur centrale (garantit que tous les appareils sont réinitialisés)
  try {
    const apiRes = await fetch('/api/admin/purge', { method: 'POST' });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      usersDeleted = apiData.usersDeleted || 0;
      transactionsDeleted = apiData.txDeleted || 0;
      investmentsDeleted = apiData.invDeleted || 0;
    }
  } catch (apiErr) {
    console.warn('Purge API error (fallback local):', apiErr);
  }

  // 2. Nettoyage LocalStorage
  try {
    const currentUsers = getLocalUsers();
    if (!usersDeleted) {
      usersDeleted = Math.max(0, currentUsers.filter(u => u.role !== 'admin' && u.phone !== SEED_ADMIN.phone && u.id !== SEED_ADMIN.id).length);
    }
    const currentTxs = getLocalTransactions();
    if (!transactionsDeleted) transactionsDeleted = currentTxs.length;
    const currentInvs = getLocalInvestments();
    if (!investmentsDeleted) investmentsDeleted = currentInvs.length;

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
          if (currentUser && currentUser.role !== 'admin' && !currentUser.phone?.includes('0704752133') && !currentUser.phone?.includes('0700000000')) {
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
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {}

  try {
    await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {}

  try {
    await supabase.from('deposit_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {}

  try {
    await supabase.from('payment_methods').delete().neq('user_id', SEED_ADMIN.id);
  } catch (e) {}

  try {
    await supabase.from('notifications').delete().neq('user_id', SEED_ADMIN.id);
  } catch (e) {}

  try {
    // Retirer tous les liens de parrainage avant suppression
    await supabase.from('users').update({ referred_by: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    // Supprimer tous les utilisateurs non-admins
    await supabase.from('users').delete().neq('role', 'admin').not('phone', 'ilike', '%0704752133%').not('phone', 'ilike', '%0700000000%').neq('id', SEED_ADMIN.id).neq('id', SEED_ADMIN_2.id);
  } catch (e) {}

  // 3. Garantir la présence et le solde à zéro de l'Administrateur sur Supabase
  try {
    await supabase.from('users').upsert({
      id: SEED_ADMIN.id,
      phone: SEED_ADMIN.phone,
      country: SEED_ADMIN.country,
      first_name: SEED_ADMIN.first_name,
      last_name: SEED_ADMIN.last_name,
      password_hash: SEED_ADMIN.password_hash,
      role: 'admin',
      balance: 0,
      referral_code: SEED_ADMIN.referral_code
    }, { onConflict: 'phone' });
  } catch (e) {}

  return { usersDeleted, transactionsDeleted, investmentsDeleted };
}

// Distribution des commissions de parrainage multi-niveaux (N1 20%, N2 2%, N3 1%)
export async function distributeInvestmentCommissions(investor: User, planAmount: number, planName: string): Promise<void> {
  if (!investor || Number(planAmount) <= 0) return;

  let localUsers = getLocalUsers();
  let investorRef = investor.referred_by ? investor.referred_by.trim() : null;

  // Si non défini sur l'objet en mémoire, tenter de le retrouver dans la base locale ou serveur
  if (!investorRef) {
    const existingSelf = localUsers.find(u => u.id === investor.id || u.phone === investor.phone);
    if (existingSelf?.referred_by) {
      investorRef = existingSelf.referred_by.trim();
    } else {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const sUsers = await res.json();
          const sSelf = sUsers.find((u: any) => u.id === investor.id || u.phone === investor.phone);
          if (sSelf?.referred_by) {
            investorRef = sSelf.referred_by.trim();
          }
        }
      } catch (e) {}
    }
  }

  if (!investorRef) return;

  const normalize = (s?: string | null) => (s || '').trim().toUpperCase().replace(/[\s\-\(\)\.]/g, '');
  const findUserByRef = (refKey: string, list: User[]): User | undefined => {
    if (!refKey) return undefined;
    const clean = refKey.trim().toUpperCase();
    const norm = normalize(clean);
    const digits = clean.replace(/\D/g, '');
    return list.find(u => 
      (u.referral_code && (normalize(u.referral_code) === norm || u.referral_code.toUpperCase() === clean)) ||
      (u.id && (u.id === refKey.trim() || normalize(u.id) === norm)) ||
      (u.phone && (
        u.phone === refKey.trim() || 
        normalize(u.phone) === norm ||
        generatePhoneCandidates(u.phone).some(c => normalize(c) === norm) ||
        (digits.length >= 8 && u.phone.replace(/\D/g, '').endsWith(digits.slice(-8)))
      ))
    );
  };

  // Si le parrain N1 n'est pas trouvé dans le cache local, synchroniser avec le serveur
  let sponsor1 = findUserByRef(investorRef, localUsers);
  if (!sponsor1) {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const serverUsers = await res.json();
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          saveLocalUsersBatch(serverUsers);
          localUsers = getLocalUsers();
          sponsor1 = findUserByRef(investorRef, localUsers);
        }
      }
    } catch (e) {}
  }

  // 1. Niveau 1 (20%)
  if (sponsor1) {
    const bonus1 = Math.round(Number(planAmount) * 0.20);
    const newBal1 = Math.max(0, Number(sponsor1.balance || 0)) + bonus1;
    sponsor1.balance = newBal1;
    saveLocalUser(sponsor1);
    fetch(`/api/users/${sponsor1.id}/balance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: newBal1 })
    }).catch(() => {});

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
      let sponsor2 = findUserByRef(sponsor1.referred_by, localUsers);
      if (sponsor2 && sponsor2.id !== sponsor1.id && sponsor2.id !== investor.id) {
        const bonus2 = Math.round(Number(planAmount) * 0.02);
        const newBal2 = Math.max(0, Number(sponsor2.balance || 0)) + bonus2;
        sponsor2.balance = newBal2;
        saveLocalUser(sponsor2);
        fetch(`/api/users/${sponsor2.id}/balance`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBal2 })
        }).catch(() => {});

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
            fetch(`/api/users/${sponsor3.id}/balance`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ balance: newBal3 })
            }).catch(() => {});

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
  const ZERO_BALANCES_FLAG = 'agritrans_zero_balances_v2';
  if (safeStorage.getItem(ZERO_BALANCES_FLAG) !== 'true') {
    safeStorage.setItem(ZERO_BALANCES_FLAG, 'true');
    resetAllBalancesToZero();
  }
}

// Suppression intégrale et définitive d'un compte (local et distant)
export async function deleteAccountCompletely(targetPhoneOrId: string): Promise<{ success: boolean; userIds: string[] }> {
  const digits = targetPhoneOrId.replace(/\D/g, '');
  const candidates = new Set<string>();
  if (targetPhoneOrId.trim()) candidates.add(targetPhoneOrId.trim());
  if (digits) {
    candidates.add(digits);
    generatePhoneCandidates(digits).forEach(c => candidates.add(c));
    generatePhoneCandidates('+' + digits).forEach(c => candidates.add(c));
  }
  
  // 1. Chercher dans les utilisateurs locaux
  const localUsers = getLocalUsers();
  const matchedUserIds = new Set<string>();
  const matchedRefCodes = new Set<string>();

  localUsers.forEach(u => {
    const uDigits = (u.phone || '').replace(/\D/g, '');
    const isMatch = candidates.has(u.id) || 
      candidates.has(u.phone) || 
      (uDigits && candidates.has(uDigits)) ||
      (digits && (uDigits.endsWith(digits) || digits.endsWith(uDigits)));
    
    if (isMatch) {
      matchedUserIds.add(u.id);
      if (u.referral_code) matchedRefCodes.add(u.referral_code);
    }
  });

  if (targetPhoneOrId) matchedUserIds.add(targetPhoneOrId);

  // Supprimer de localUsers
  const remainingUsers = localUsers.filter(u => !matchedUserIds.has(u.id) && !isPermanentlyDeletedPhone(u.phone));
  safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(remainingUsers));

  // Purger la session auth si l'utilisateur actif est celui supprimé
  try {
    const authRaw = safeStorage.getItem('translogis-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const activeUser = parsed?.state?.user;
      if (activeUser) {
        const aDigits = (activeUser.phone || '').replace(/\D/g, '');
        if (
          matchedUserIds.has(activeUser.id) || 
          candidates.has(activeUser.phone) || 
          isPermanentlyDeletedPhone(activeUser.phone) ||
          (digits && aDigits.endsWith(digits))
        ) {
          safeStorage.removeItem('translogis-auth');
        }
      }
    }
  } catch (e) {}

  // Supprimer les transactions locales de ces utilisateurs
  try {
    const localTxs = getLocalTransactions().filter(t => !matchedUserIds.has(t.user_id));
    safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(localTxs));
  } catch (e) {}

  // Supprimer les investissements locaux de ces utilisateurs
  try {
    const localInvs = getLocalInvestments().filter(i => !matchedUserIds.has(i.user_id));
    safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(localInvs));
  } catch (e) {}

  // Supprimer les caches liés
  matchedUserIds.forEach(id => {
    safeStorage.removeItem(`agritrans_claimed_commissions_${id}`);
    safeStorage.removeItem(`agritrans_team_cache_${id}`);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('agritrans_user_updated'));
    window.dispatchEvent(new Event('agritrans_tx_updated'));
  }

  // 2. Supprimer sur Supabase (avec gestion d'erreur résiliente)
  try {
    const candidateList = Array.from(candidates);
    const { data: dbUsers } = await supabase
      .from('users')
      .select('id, referral_code, phone')
      .or(`phone.in.(${candidateList.map(c => `"${c}"`).join(',')}),id.in.(${Array.from(matchedUserIds).map(id => `"${id}"`).join(',')})`);

    if (dbUsers && dbUsers.length > 0) {
      dbUsers.forEach(u => {
        matchedUserIds.add(u.id);
        if (u.referral_code) matchedRefCodes.add(u.referral_code);
      });
    }

    const idsArray = Array.from(matchedUserIds).filter(Boolean);
    if (idsArray.length > 0) {
      await Promise.allSettled([
        supabase.from('transactions').delete().in('user_id', idsArray),
        supabase.from('investments').delete().in('user_id', idsArray),
        supabase.from('deposit_verifications').delete().in('user_id', idsArray),
        supabase.from('payment_methods').delete().in('user_id', idsArray),
        supabase.from('notifications').delete().in('user_id', idsArray),
        ...Array.from(matchedRefCodes).map(code => 
          supabase.from('users').update({ referred_by: null }).eq('referred_by', code)
        ),
        supabase.from('users').delete().in('id', idsArray)
      ]);
    }

    // Supprimer également par correspondance téléphone directe sur Supabase
    await Promise.allSettled([
      supabase.from('users').delete().in('phone', candidateList)
    ]);
  } catch (e) {
    console.warn('Sync suppression Supabase (non bloquant):', e);
  }

  return { success: true, userIds: Array.from(matchedUserIds) };
}

// Suppression immédiate et automatique du compte 2250574641956 demandée par l'administrateur
if (typeof window !== 'undefined') {
  deleteAccountCompletely('2250574641956');
}

// Synchronisation centralisée avec le serveur Express
export async function syncAllDataWithServer(): Promise<void> {
  try {
    const [usersRes, txRes, invRes, setRes] = await Promise.all([
      fetch('/api/users').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/transactions').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/investments').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    if (usersRes && Array.isArray(usersRes) && usersRes.length > 0) {
      safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersRes));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('agritrans_user_updated'));
    }
    if (txRes && Array.isArray(txRes)) {
      safeStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txRes));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('agritrans_tx_updated'));
    }
    if (invRes && Array.isArray(invRes)) {
      safeStorage.setItem(LOCAL_INV_KEY, JSON.stringify(invRes));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('agritrans_inv_updated'));
    }
    if (setRes && typeof setRes === 'object') {
      const currentSets = getLocalSettings();
      safeStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify({ ...currentSets, ...setRes }));
    }
  } catch (e) {
    // Non-bloquant
  }
}

// Lancement automatique de la synchronisation en arrière-plan
if (typeof window !== 'undefined') {
  syncAllDataWithServer();
  setInterval(syncAllDataWithServer, 15000);
}
