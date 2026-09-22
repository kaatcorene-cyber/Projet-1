import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../lib/storage';
import { 
  ALL_DIAL_CODES, 
  generatePhoneCandidates, 
  isPermanentlyDeletedPhone,
  BANNED_PHONES 
} from '../lib/phoneUtils';

export { 
  ALL_DIAL_CODES, 
  generatePhoneCandidates, 
  isPermanentlyDeletedPhone,
  BANNED_PHONES 
};

export interface User {
  id: string;
  phone: string;
  country: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  referral_code: string;
  referred_by?: string | null;
  password_hash?: string;
  created_at?: string;
}

const LOCAL_USERS_KEY = 'agritrans_local_users';

// Compte administrateur par défaut
const DEFAULT_SEED_USERS: User[] = [
  {
    id: 'admin-seed-001',
    phone: '+2250704752133',
    country: "Côte d'Ivoire",
    first_name: 'Admin',
    last_name: 'AgriTrans',
    password_hash: 'Calmaress225@',
    role: 'admin',
    balance: 0,
    referral_code: 'AGRIADMIN',
    created_at: new Date().toISOString()
  }
];

export function getStoredLocalUsers(): User[] {
  try {
    const raw = safeStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(u => !isPermanentlyDeletedPhone(u.phone));
        // Toujours s'assurer que le compte admin fait partie de la liste
        if (!filtered.some(u => u.phone === '+2250704752133' || u.phone === '0704752133')) {
          filtered.unshift(DEFAULT_SEED_USERS[0]);
        }
        return filtered;
      }
    }
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_SEED_USERS));
    return DEFAULT_SEED_USERS;
  } catch (e) {
    return DEFAULT_SEED_USERS;
  }
}

export function saveStoredLocalUser(newUser: User): void {
  if (isPermanentlyDeletedPhone(newUser.phone)) {
    return;
  }
  try {
    const users = getStoredLocalUsers();
    const existingIndex = users.findIndex(u => 
      u.id === newUser.id || 
      u.phone === newUser.phone || 
      generatePhoneCandidates(u.phone).includes(newUser.phone)
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    // Notifier immédiatement l'interface et le serveur interne
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_user_updated'));
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde locale utilisateur:', e);
  }
}

export function deleteStoredLocalUser(userId: string): void {
  try {
    const users = getStoredLocalUsers().filter(u => u.id !== userId);
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agritrans_user_updated'));
      fetch(`/api/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    }
  } catch (e) {}
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateBalance: (newBalance: number) => void;
  login: (phone: string, passwordHash: string, countryDialCode?: string) => Promise<User>;
  register: (phone: string, passwordHash: string, firstName?: string, lastName?: string, referralCode?: string, country?: string, countryDialCode?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateBalance: (newBalance) => {
        const current = get().user;
        if (current) {
          const updated = { ...current, balance: newBalance };
          saveStoredLocalUser(updated);
          set({ user: updated });
        }
      },
      login: async (phone, password, countryDialCode = '+225') => {
        if (isPermanentlyDeletedPhone(phone)) {
          throw new Error('Ce compte a été définitivement supprimé de la plateforme.');
        }
        const candidates = generatePhoneCandidates(phone, countryDialCode);
        const localUsers = getStoredLocalUsers();

        // 1. Recherche locale prioritaire (immédiate et sans latence réseau)
        let matchedUser = localUsers.find(lu => {
          const luCandidates = generatePhoneCandidates(lu.phone);
          return candidates.some(c => luCandidates.includes(c) || lu.phone === c);
        });

        // Tolérance par chiffres significatifs de fin
        if (!matchedUser) {
          const pureDigits = phone.replace(/\D/g, '');
          const sigDigits = pureDigits.slice(-8);
          if (sigDigits.length >= 7) {
            matchedUser = localUsers.find(lu => lu.phone.replace(/\D/g, '').endsWith(sigDigits));
          }
        }

        if (matchedUser) {
          if (matchedUser.password_hash !== password) {
            throw new Error('Mot de passe incorrect.');
          }
          try { sessionStorage.setItem('agritrans_show_welcome', 'true'); } catch (e) {}
          set({ user: matchedUser, isAuthenticated: true });

          // Synchronisation discrète avec Supabase si connecté (sans faire attendre l'utilisateur)
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            supabase
              .from('users')
              .select('*')
              .in('phone', candidates)
              .abortSignal(controller.signal)
              .maybeSingle()
              .then(
                ({ data: dbU }) => {
                  clearTimeout(timer);
                  if (dbU) {
                    const merged = { ...matchedUser, ...dbU, balance: Number(dbU.balance || 0) };
                    saveStoredLocalUser(merged);
                    set({ user: merged });
                  }
                },
                () => {
                  clearTimeout(timer);
                }
              );
          } catch (e) {}

          return matchedUser;
        }

        // 2. Si l'utilisateur n'est pas dans le cache local, interroger le serveur local d'abord (<5ms)
        let remoteUser: User | null = null;
        try {
          const sRes = await fetch('/api/users');
          if (sRes.ok) {
            const serverUsers = await sRes.json();
            if (Array.isArray(serverUsers)) {
              const matchedInServer = serverUsers.find((u: any) => {
                const uCandidates = generatePhoneCandidates(u.phone);
                return candidates.some(c => uCandidates.includes(c));
              });
              if (matchedInServer) {
                remoteUser = matchedInServer;
                saveStoredLocalUser(matchedInServer);
              }
            }
          }
        } catch (e) {}

        // 3. Si toujours non trouvé, interroger Supabase avec timeout
        if (!remoteUser) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);

            const { data: matchedUsers, error: queryError } = await supabase
              .from('users')
              .select('*')
              .in('phone', candidates)
              .abortSignal(controller.signal);

            clearTimeout(timer);

            if (!queryError && matchedUsers && matchedUsers.length > 0) {
              remoteUser = matchedUsers[0];
            } else {
              const pureDigits = phone.replace(/\D/g, '');
              const sigDigits = pureDigits.slice(-8);
              if (sigDigits.length >= 7) {
                const { data: fallbackUsers } = await supabase
                  .from('users')
                  .select('*')
                  .ilike('phone', `%${sigDigits}%`)
                  .limit(1);
                if (fallbackUsers && fallbackUsers.length > 0) {
                  remoteUser = fallbackUsers[0];
                }
              }
            }
          } catch (e) {}
        }

        if (!remoteUser) {
          throw new Error('Numéro de téléphone introuvable. Veuillez vérifier votre saisie ou créer un compte.');
        }

        if (remoteUser.password_hash !== password) {
          throw new Error('Mot de passe incorrect.');
        }

        try { sessionStorage.setItem('agritrans_show_welcome', 'true'); } catch (e) {}
        saveStoredLocalUser(remoteUser);
        set({ user: remoteUser, isAuthenticated: true });
        return remoteUser;
      },
      register: async (phone, password, firstName = '', lastName = '', referralCode = '', country = "Côte d'Ivoire", countryDialCode = '+225') => {
        const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
        const dial = countryDialCode || '+225';
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `${dial}${cleanPhone}`;

        if (isPermanentlyDeletedPhone(cleanPhone) || isPermanentlyDeletedPhone(fullPhone)) {
          throw new Error('Ce compte a été définitivement supprimé de la plateforme.');
        }

        // Vérification préalable d'unicité avec tous les formats candidats
        const candidates = generatePhoneCandidates(fullPhone, dial);

        // 1. Vérification dans le stockage local
        const localUsers = getStoredLocalUsers();
        const existsLocally = localUsers.some(lu => {
          const luCandidates = generatePhoneCandidates(lu.phone);
          return candidates.some(c => luCandidates.includes(c));
        });

        if (existsLocally) {
          throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
        }

        // 2. Vérification sur le serveur local
        try {
          const sRes = await fetch('/api/users');
          if (sRes.ok) {
            const serverUsers = await sRes.json();
            if (Array.isArray(serverUsers)) {
              const existsOnServer = serverUsers.some((su: any) => {
                const suCandidates = generatePhoneCandidates(su.phone);
                return candidates.some(c => suCandidates.includes(c));
              });
              if (existsOnServer) {
                throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
              }
            }
          }
        } catch (e: any) {
          if (e?.message?.includes('déjà associé')) throw e;
        }

        // 3. Vérification sur Supabase avec timeout de sécurité (1.5s)
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1500);
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .in('phone', candidates)
            .abortSignal(controller.signal)
            .limit(1);
          clearTimeout(timer);

          if (existing && existing.length > 0) {
            throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
          }
        } catch (e: any) {
          if (e?.message?.includes('déjà associé')) throw e;
        }

        // Code de parrainage unique AgriTrans
        const genReferralCode = 'AGRI' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Résolution robuste et insensible à la casse du parrain
        let validReferrerCode: string | null = null;
        if (referralCode && referralCode.trim()) {
          const cleanRef = referralCode.trim().toUpperCase();
          const cleanDigits = referralCode.replace(/\D/g, '');

          const isUserMatch = (u: any) => {
            if (!u) return false;
            if (u.referral_code && u.referral_code.toUpperCase() === cleanRef) return true;
            if (u.id && (u.id === cleanRef || u.id === referralCode.trim())) return true;
            if (u.phone) {
              const uPhone = u.phone.toUpperCase();
              if (uPhone === cleanRef) return true;
              if (generatePhoneCandidates(u.phone).some(c => c.toUpperCase() === cleanRef)) return true;
              if (cleanDigits.length >= 8 && u.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-8))) return true;
            }
            return false;
          };

          // 1. Recherche locale prioritaire
          const localRef = localUsers.find(isUserMatch);
          if (localRef && localRef.referral_code) {
            validReferrerCode = localRef.referral_code;
          } else {
            // 2. Recherche sur le serveur d'API interne (<5ms)
            try {
              const res = await fetch('/api/users');
              if (res.ok) {
                const sUsers = await res.json();
                if (Array.isArray(sUsers)) {
                  const sRef = sUsers.find(isUserMatch);
                  if (sRef && sRef.referral_code) {
                    validReferrerCode = sRef.referral_code;
                  }
                }
              }
            } catch (e) {}
          }

          if (!validReferrerCode) {
            validReferrerCode = cleanRef;
          }
        }

        const newUserPayload: User = {
          id: 'usr-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
          phone: fullPhone,
          password_hash: password,
          first_name: firstName || 'Partenaire',
          last_name: lastName || '',
          role: 'user',
          balance: 0,
          referral_code: genReferralCode,
          referred_by: validReferrerCode || null,
          country: country || "Côte d'Ivoire",
          created_at: new Date().toISOString()
        };

        // Sauvegarder immédiatement en local pour garantir la disponibilité
        saveStoredLocalUser(newUserPayload);

        // Sauvegarder sur le serveur persistant immédiatement
        try {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUserPayload)
          });
        } catch (e) {
          console.warn('Erreur sauvegarde serveur:', e);
        }

        // Tenter d'enregistrer sur Supabase en tâche de fond non bloquante
        try {
          const supabaseQuery = supabase
            .from('users')
            .insert([{
              phone: fullPhone,
              password_hash: password,
              first_name: firstName || 'Partenaire',
              last_name: lastName || '',
              role: 'user',
              balance: 0,
              referral_code: genReferralCode,
              referred_by: validReferrerCode || null,
              country: country || "Côte d'Ivoire"
            }])
            .select();

          Promise.resolve(supabaseQuery)
            .then((res: any) => {
              const createdUser = res?.data;
              const insertError = res?.error;
              if (!insertError && createdUser && createdUser[0]) {
                saveStoredLocalUser(createdUser[0]);
              }
            })
            .catch(() => {});
        } catch (dbErr) {
          // Supabase indisponible, continuer normalement
        }

        try {
          sessionStorage.setItem('agritrans_show_welcome', 'true');
        } catch (e) {}

        set({ user: newUserPayload, isAuthenticated: true });
      },
      logout: () => {
        try {
          sessionStorage.removeItem('agritrans_show_welcome');
        } catch (e) {}
        set({ user: null, isAuthenticated: false });
      },
      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        // 1. D'abord interroger le serveur local d'API interne (<5ms)
        try {
          const res = await fetch(`/api/users/${encodeURIComponent(user.id)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) {
              if (user.password_hash && data.password_hash && data.password_hash !== user.password_hash) {
                get().logout();
                return;
              }
              saveStoredLocalUser(data);
              set({ user: data });
              return;
            }
          }
        } catch (e) {}

        // 2. Fallback dans le stockage local
        const localUsers = getStoredLocalUsers();
        const local = localUsers.find(u => u.id === user.id || u.phone === user.phone);
        if (local) {
          set({ user: local });
          return;
        }

        // 3. Tâche de fond distante sécurisée avec timeout court
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1200);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .abortSignal(controller.signal)
            .maybeSingle();
          clearTimeout(timer);

          if (!error && data) {
            if (user.password_hash && data.password_hash && data.password_hash !== user.password_hash) {
              get().logout();
              return;
            }
            saveStoredLocalUser(data);
            set({ user: data });
          }
        } catch (e) {}
      }
    }),
    {
      name: 'translogis-auth',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
