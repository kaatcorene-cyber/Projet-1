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
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde locale utilisateur:', e);
  }
}

export function deleteStoredLocalUser(userId: string): void {
  try {
    const users = getStoredLocalUsers().filter(u => u.id !== userId);
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
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

        // 2. Si l'utilisateur n'est pas dans le cache local, interroger Supabase (timeout 2.5s)
        let remoteUser: User | null = null;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);

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

        // 2. Vérification sur Supabase avec timeout de sécurité
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
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

        // Code de parrainage unique
        const genReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Résolution robuste et insensible à la casse du parrain
        let validReferrerCode: string | null = null;
        if (referralCode && referralCode.trim()) {
          const cleanRef = referralCode.trim().toUpperCase();

          // Recherche locale prioritaire
          const localRef = localUsers.find(u => 
            (u.referral_code && u.referral_code.toUpperCase() === cleanRef) ||
            (u.id && u.id === referralCode.trim()) ||
            (u.phone && (u.phone === cleanRef || generatePhoneCandidates(u.phone).includes(cleanRef)))
          );

          if (localRef && localRef.referral_code) {
            validReferrerCode = localRef.referral_code;
          } else {
            // Recherche distante Supabase avec timeout
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 2000);
              const { data: refUser } = await supabase
                .from('users')
                .select('id, referral_code')
                .or(`referral_code.ilike.${cleanRef},id.eq.${referralCode.trim()}`)
                .abortSignal(controller.signal)
                .maybeSingle();
              clearTimeout(timer);

              if (refUser && refUser.referral_code) {
                validReferrerCode = refUser.referral_code;
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

        // Tenter d'enregistrer sur Supabase avec timeout
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);

          const { data: createdUser, error: insertError } = await supabase
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
            .select()
            .abortSignal(controller.signal)
            .single();

          clearTimeout(timer);

          if (!insertError && createdUser) {
            saveStoredLocalUser(createdUser);
            try { sessionStorage.setItem('agritrans_show_welcome', 'true'); } catch (e) {}
            set({ user: createdUser, isAuthenticated: true });
            return;
          }
        } catch (dbErr) {
          console.warn('Supabase non accessible, utilisateur enregistré en stockage persistant local.');
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

        try {
          const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
          if (!error && data) {
            if (user.password_hash && data.password_hash !== user.password_hash) {
              get().logout();
              return;
            }
            if (!data.referral_code) {
              const myReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();
              await supabase.from('users').update({ referral_code: myReferralCode }).eq('id', user.id);
              data.referral_code = myReferralCode;
            }
            saveStoredLocalUser(data);
            set({ user: data });
            return;
          }
        } catch (e) {
          // Si Supabase est inaccessible, conserver l'utilisateur local
        }

        // Fallback local
        const localUsers = getStoredLocalUsers();
        const local = localUsers.find(u => u.id === user.id || u.phone === user.phone);
        if (local) {
          set({ user: local });
        }
      }
    }),
    {
      name: 'translogis-auth',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
