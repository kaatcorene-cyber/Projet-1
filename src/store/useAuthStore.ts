import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../lib/storage';

// Liste de tous les indicatifs supportés
const ALL_DIAL_CODES = ['+225', '+228', '+226', '+229', '+227', '+223', '+221', '+237', '+224'];

/**
 * Génère l'ensemble exhaustif des formats possibles sous lesquels
 * un numéro a pu être enregistré en base (avec/sans indicatif, avec/sans zéro, etc.).
 */
export function generatePhoneCandidates(inputPhone: string, defaultDialCode = '+225'): string[] {
  const clean = inputPhone.trim().replace(/[\s\-\(\)\.]/g, '');
  const pureDigits = clean.replace(/\D/g, '');
  if (!pureDigits && !clean) return [];

  const candidates = new Set<string>();

  if (clean) candidates.add(clean);
  if (pureDigits) {
    candidates.add(pureDigits);
    candidates.add(`+${pureDigits}`);
  }

  // Détection d'un indicatif déjà présent dans la saisie
  let detectedDial = defaultDialCode.startsWith('+') ? defaultDialCode : `+${defaultDialCode}`;
  let national = pureDigits;

  for (const dial of ALL_DIAL_CODES) {
    const dialDigits = dial.replace('+', '');
    if (clean.startsWith(dial)) {
      detectedDial = dial;
      national = clean.slice(dial.length).replace(/\D/g, '');
      break;
    } else if (pureDigits.startsWith(dialDigits) && pureDigits.length > dialDigits.length + 5) {
      detectedDial = dial;
      national = pureDigits.slice(dialDigits.length);
      break;
    }
  }

  const nationalNoZero = national.replace(/^0+/, '');
  const nationalWithZero = national ? (national.startsWith('0') ? national : `0${national}`) : '';

  // Indicatifs prioritaires à tester (indicatif détecté, indicatif choisi, puis tous les indicatifs)
  const priorityDials = Array.from(new Set([detectedDial, defaultDialCode, ...ALL_DIAL_CODES]));

  for (const dial of priorityDials) {
    const dialDigits = dial.replace('+', '');

    if (national) {
      candidates.add(`${dial}${national}`);
      candidates.add(`${dialDigits}${national}`);
    }
    if (nationalNoZero) {
      candidates.add(`${dial}${nationalNoZero}`);
      candidates.add(`${dialDigits}${nationalNoZero}`);
    }
    if (nationalWithZero) {
      candidates.add(`${dial}${nationalWithZero}`);
      candidates.add(`${dialDigits}${nationalWithZero}`);
    }
  }

  // Variantes nationales pures
  if (national) candidates.add(national);
  if (nationalNoZero) candidates.add(nationalNoZero);
  if (nationalWithZero) candidates.add(nationalWithZero);

  return Array.from(candidates).filter(c => c && c.length >= 6);
}

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

// Compte administrateur et comptes de démonstration par défaut
const DEFAULT_SEED_USERS: User[] = [
  {
    id: 'admin-seed-001',
    phone: '+2250704752133',
    country: "Côte d'Ivoire",
    first_name: 'Admin',
    last_name: 'AgriTrans',
    password_hash: 'Calmaress225@',
    role: 'admin',
    balance: 50000,
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
        // Toujours s'assurer que le compte admin fait partie de la liste
        if (!parsed.some(u => u.phone === '+2250704752133' || u.phone === '0704752133')) {
          parsed.unshift(DEFAULT_SEED_USERS[0]);
        }
        return parsed;
      }
    }
    safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_SEED_USERS));
    return DEFAULT_SEED_USERS;
  } catch (e) {
    return DEFAULT_SEED_USERS;
  }
}

export function saveStoredLocalUser(newUser: User): void {
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
        const candidates = generatePhoneCandidates(phone, countryDialCode);
        
        let foundUsers: User[] = [];
        let isDbOnline = true;

        // 1. Recherche par correspondance exacte sur tous les formats possibles via Supabase si disponible
        if (candidates.length > 0) {
          try {
            const { data: matchedUsers, error: queryError } = await supabase
              .from('users')
              .select('*')
              .in('phone', candidates);

            if (queryError) {
              isDbOnline = false;
            } else if (matchedUsers && matchedUsers.length > 0) {
              foundUsers = matchedUsers;
              matchedUsers.forEach(saveStoredLocalUser);
            }
          } catch (e) {
            isDbOnline = false;
          }
        }

        // 2. Recherche tolérante en ligne si aucun résultat
        if (foundUsers.length === 0 && isDbOnline) {
          try {
            const pureDigits = phone.replace(/\D/g, '');
            const sigDigits = pureDigits.slice(-8); // Les 8 derniers chiffres uniques de l'abonné
            if (sigDigits.length >= 7) {
              const { data: fallbackUsers, error: fbError } = await supabase
                .from('users')
                .select('*')
                .ilike('phone', `%${sigDigits}%`);

              if (!fbError && fallbackUsers && fallbackUsers.length > 0) {
                foundUsers = fallbackUsers;
                fallbackUsers.forEach(saveStoredLocalUser);
              }
            }
          } catch (e) {
            isDbOnline = false;
          }
        }

        // 3. Fallback immédiat vers le stockage local en cas de base hors-ligne ou compte local
        if (foundUsers.length === 0) {
          const localUsers = getStoredLocalUsers();

          // Recherche locale par formats candidats
          foundUsers = localUsers.filter(lu => {
            const luCandidates = generatePhoneCandidates(lu.phone);
            return candidates.some(c => luCandidates.includes(c) || lu.phone === c);
          });

          // Recherche locale secondaire par chiffres de fin (tolérance 7-8 chiffres)
          if (foundUsers.length === 0) {
            const pureDigits = phone.replace(/\D/g, '');
            const sigDigits = pureDigits.slice(-8);
            if (sigDigits.length >= 7) {
              foundUsers = localUsers.filter(lu => lu.phone.replace(/\D/g, '').includes(sigDigits));
            }
          }
        }

        if (!foundUsers || foundUsers.length === 0) {
          throw new Error('Numéro de téléphone introuvable. Veuillez vérifier votre saisie ou créer un compte.');
        }

        // Si des correspondances sont trouvées, vérifier le mot de passe
        const matchedUser = foundUsers.find(u => u.password_hash === password);
        if (!matchedUser) {
          throw new Error('Mot de passe incorrect.');
        }

        try {
          sessionStorage.setItem('agritrans_show_welcome', 'true');
        } catch (e) {}

        // Mettre à jour le cache local avec le profil authentifié
        saveStoredLocalUser(matchedUser);

        set({ user: matchedUser, isAuthenticated: true });
        return matchedUser;
      },
      register: async (phone, password, firstName = '', lastName = '', referralCode = '', country = "Côte d'Ivoire", countryDialCode = '+225') => {
        const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
        const dial = countryDialCode || '+225';
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `${dial}${cleanPhone}`;

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

        // 2. Vérification sur Supabase si connecté
        try {
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .in('phone', candidates)
            .limit(1);

          if (existing && existing.length > 0) {
            throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
          }
        } catch (e: any) {
          if (e?.message?.includes('déjà associé')) throw e;
        }

        // Generate unique referral code
        const genReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Check referrer
        let validReferrerCode: string | null = null;
        if (referralCode && referralCode.trim()) {
          const cleanRef = referralCode.trim();
          try {
            const { data: refUser } = await supabase
              .from('users')
              .select('id, referral_code')
              .eq('referral_code', cleanRef)
              .maybeSingle();

            if (refUser) {
              validReferrerCode = refUser.referral_code;
            } else {
              const { data: refUserById } = await supabase
                .from('users')
                .select('id, referral_code')
                .eq('id', cleanRef)
                .maybeSingle();
              if (refUserById) {
                validReferrerCode = refUserById.referral_code;
              }
            }
          } catch (e) {
            // Ignorer si hors-ligne
          }
          if (!validReferrerCode) {
            const localRef = localUsers.find(u => u.referral_code === cleanRef || u.id === cleanRef);
            if (localRef) validReferrerCode = localRef.referral_code;
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
          referred_by: validReferrerCode || (referralCode?.trim() || null),
          country: country || "Côte d'Ivoire",
          created_at: new Date().toISOString()
        };

        // Sauvegarder immédiatement en local pour garantir la disponibilité
        saveStoredLocalUser(newUserPayload);

        // Tenter d'enregistrer sur Supabase
        try {
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
              referred_by: validReferrerCode || (referralCode?.trim() || null),
              country: country || "Côte d'Ivoire"
            }])
            .select()
            .single();

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
