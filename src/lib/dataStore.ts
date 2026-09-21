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
  SEED_ADMIN,
  {
    id: 'usr-demo-002',
    phone: '+2250102030405',
    country: "Côte d'Ivoire",
    first_name: 'Kouamé',
    last_name: 'Yao',
    password_hash: 'AgriTrans2026@',
    role: 'user',
    balance: 24500,
    referral_code: 'TL84920',
    referred_by: 'AGRIADMIN',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'usr-demo-003',
    phone: '+22890112233',
    country: 'Togo',
    first_name: 'Messan',
    last_name: 'Lawson',
    password_hash: 'AgriTrans2026@',
    role: 'user',
    balance: 12000,
    referral_code: 'TL51294',
    referred_by: 'AGRIADMIN',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

const SEED_TRANSACTIONS: LocalTransaction[] = [
  {
    id: 'tx-seed-101',
    user_id: 'usr-demo-002',
    type: 'deposit',
    amount: 50000,
    status: 'approved',
    reference: 'Wave CI - 0102030405 (Dépôt direct)',
    description: 'Rechargement de compte via Wave',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    users: { first_name: 'Kouamé', last_name: 'Yao', phone: '+2250102030405' }
  },
  {
    id: 'tx-seed-102',
    user_id: 'usr-demo-002',
    type: 'investment',
    amount: 30000,
    status: 'approved',
    reference: 'Souscription - Camion Frigorifique Isuzu',
    description: 'Activation de véhicule de transport',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    users: { first_name: 'Kouamé', last_name: 'Yao', phone: '+2250102030405' }
  },
  {
    id: 'tx-seed-103',
    user_id: 'usr-demo-003',
    type: 'deposit',
    amount: 15000,
    status: 'pending',
    reference: 'Tmoney TG - 90112233',
    description: 'Demande de rechargement en attente',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    users: { first_name: 'Messan', last_name: 'Lawson', phone: '+22890112233' }
  },
  {
    id: 'tx-seed-104',
    user_id: 'usr-demo-002',
    type: 'withdrawal',
    amount: 8000,
    status: 'pending',
    reference: '[Côte d\'Ivoire] Wave - +225 0102030405 (Kouamé Yao) | Net: 6800 FCFA (Frais 15%: 1200 FCFA)',
    description: 'Demande de retrait vers Wave',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    users: { first_name: 'Kouamé', last_name: 'Yao', phone: '+2250102030405' }
  }
];

const SEED_INVESTMENTS: LocalInvestment[] = [
  {
    id: 'inv-seed-201',
    user_id: 'usr-demo-002',
    plan_amount: 30000,
    daily_yield: 2100,
    start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 57 * 86400000).toISOString(),
    last_paid_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    users: { first_name: 'Kouamé', last_name: 'Yao', phone: '+2250102030405' }
  }
];

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
