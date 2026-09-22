import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  phone: string;
  country: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  balance: number;
  referral_code: string;
  referred_by?: string | null;
  created_at: string;
}

export interface TransactionRecord {
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

export interface InvestmentRecord {
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

export interface AppSettings {
  payment_link?: string;
  group_link?: string;
  support_link?: string;
  telegram_link?: string;
  whatsapp_support?: string;
  ussd_ci?: string;
  wave_number?: string;
  ussd_mtn_ci?: string;
  app_logo?: string;
  investment_plans?: string;
  [key: string]: string | undefined;
}

export interface DatabaseSchema {
  users: UserRecord[];
  transactions: TransactionRecord[];
  investments: InvestmentRecord[];
  settings: AppSettings;
}

export const SEED_ADMIN: UserRecord = {
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

export const DEFAULT_SETTINGS: AppSettings = {
  ussd_ci: '*144*4*6*1000#',
  wave_number: '0704752133',
  ussd_mtn_ci: '*133#',
  payment_link: 'https://payin.moneyfusion.net',
  support_link: 'https://wa.me/2250704752133',
  group_link: 'https://t.me/agritrans_officiel',
  telegram_link: 'https://t.me/agritrans_officiel',
  whatsapp_support: 'https://wa.me/2250704752133',
  app_logo: '/agritrans-logo.png'
};

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'app_db.json');

class ServerDatabase {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          // Assurer la présence de l'admin
          if (!parsed.users.some((u: UserRecord) => u.phone === SEED_ADMIN.phone || u.id === SEED_ADMIN.id)) {
            parsed.users.unshift(SEED_ADMIN);
          }
          return {
            users: parsed.users || [SEED_ADMIN],
            transactions: parsed.transactions || [],
            investments: parsed.investments || [],
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
          };
        }
      }
    } catch (e) {
      console.warn('Erreur lors du chargement de la DB fichier:', e);
    }

    const initial: DatabaseSchema = {
      users: [SEED_ADMIN],
      transactions: [],
      investments: [],
      settings: DEFAULT_SETTINGS
    };
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erreur sauvegarde DB fichier:', e);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
      this.saveTimeout = null;
    }, 100);
  }

  // --- USERS ---
  public getUsers(): UserRecord[] {
    return [...this.data.users];
  }

  public getUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByPhone(phone: string): UserRecord | undefined {
    const cleanDigits = phone.replace(/\D/g, '');
    return this.data.users.find(u => {
      if (u.phone === phone) return true;
      const uDigits = u.phone.replace(/\D/g, '');
      if (uDigits === cleanDigits) return true;
      if (cleanDigits.length >= 8 && uDigits.endsWith(cleanDigits.slice(-8))) return true;
      return false;
    });
  }

  public upsertUser(user: UserRecord): UserRecord {
    const cleanDigits = user.phone.replace(/\D/g, '');
    const idx = this.data.users.findIndex(u => 
      u.id === user.id || 
      u.phone === user.phone || 
      (cleanDigits.length >= 8 && u.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-8)))
    );

    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
      this.save();
      return this.data.users[idx];
    } else {
      this.data.users.unshift(user);
      this.save();
      return user;
    }
  }

  public updateUserBalance(userId: string, newBalance: number): UserRecord | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.balance = Math.max(0, Number(newBalance) || 0);
    this.save();
    return user;
  }

  public updateUserRole(userId: string, role: string): UserRecord | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.role = role;
    this.save();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId && u.phone !== SEED_ADMIN.phone);
    // Supprimer également les transactions et investissements
    this.data.transactions = this.data.transactions.filter(t => t.user_id !== userId);
    this.data.investments = this.data.investments.filter(i => i.user_id !== userId);
    this.save();
    return this.data.users.length < initialLen;
  }

  // --- TRANSACTIONS ---
  public getTransactions(userId?: string): TransactionRecord[] {
    const userMap = new Map<string, UserRecord>();
    this.data.users.forEach(u => userMap.set(u.id, u));

    let txs = [...this.data.transactions];
    if (userId) {
      txs = txs.filter(t => t.user_id === userId);
    }

    return txs.map(t => {
      const usr = userMap.get(t.user_id);
      return {
        ...t,
        users: t.users || (usr ? { first_name: usr.first_name, last_name: usr.last_name, phone: usr.phone } : undefined)
      };
    });
  }

  public upsertTransaction(tx: TransactionRecord): TransactionRecord {
    const idx = this.data.transactions.findIndex(t => t.id === tx.id);
    if (idx >= 0) {
      this.data.transactions[idx] = { ...this.data.transactions[idx], ...tx };
    } else {
      this.data.transactions.unshift(tx);
    }
    this.save();
    return tx;
  }

  public updateTransactionStatus(txId: string, status: string): TransactionRecord | null {
    const tx = this.data.transactions.find(t => t.id === txId);
    if (!tx) return null;
    const oldStatus = tx.status;
    tx.status = status;

    // Si validation d'un dépôt approuvé
    if (tx.type === 'deposit' && status === 'completed' && oldStatus !== 'completed') {
      const user = this.data.users.find(u => u.id === tx.user_id);
      if (user) {
        user.balance = (Number(user.balance) || 0) + Number(tx.amount || 0);
      }
    }
    // Si annulation d'un retrait rejeté -> recréditer
    if (tx.type === 'withdrawal' && (status === 'rejected' || status === 'cancelled') && oldStatus === 'pending') {
      const user = this.data.users.find(u => u.id === tx.user_id);
      if (user) {
        user.balance = (Number(user.balance) || 0) + Number(tx.amount || 0);
      }
    }

    this.save();
    return tx;
  }

  public deleteTransaction(txId: string): boolean {
    const initialLen = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter(t => t.id !== txId);
    this.save();
    return this.data.transactions.length < initialLen;
  }

  // --- INVESTMENTS ---
  public getInvestments(userId?: string): InvestmentRecord[] {
    const userMap = new Map<string, UserRecord>();
    this.data.users.forEach(u => userMap.set(u.id, u));

    let invs = [...this.data.investments];
    if (userId) {
      invs = invs.filter(i => i.user_id === userId);
    }

    return invs.map(i => {
      const usr = userMap.get(i.user_id);
      return {
        ...i,
        users: i.users || (usr ? { first_name: usr.first_name, last_name: usr.last_name, phone: usr.phone } : undefined)
      };
    });
  }

  public upsertInvestment(inv: InvestmentRecord): InvestmentRecord {
    const idx = this.data.investments.findIndex(i => i.id === inv.id);
    if (idx >= 0) {
      this.data.investments[idx] = { ...this.data.investments[idx], ...inv };
    } else {
      this.data.investments.unshift(inv);
    }
    this.save();
    return inv;
  }

  public updateInvestment(invId: string, updates: Partial<InvestmentRecord>): InvestmentRecord | null {
    const inv = this.data.investments.find(i => i.id === invId);
    if (!inv) return null;
    Object.assign(inv, updates);
    this.save();
    return inv;
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // --- PURGE ---
  public purgeAllExceptAdmin(): { usersDeleted: number; txDeleted: number; invDeleted: number } {
    const usersDeleted = this.data.users.filter(u => u.phone !== SEED_ADMIN.phone && u.id !== SEED_ADMIN.id).length;
    const txDeleted = this.data.transactions.length;
    const invDeleted = this.data.investments.length;

    SEED_ADMIN.balance = 0;
    this.data.users = [{ ...SEED_ADMIN, balance: 0 }];
    this.data.transactions = [];
    this.data.investments = [];
    this.saveImmediate(this.data);

    return { usersDeleted, txDeleted, invDeleted };
  }
}

export const serverDb = new ServerDatabase();
