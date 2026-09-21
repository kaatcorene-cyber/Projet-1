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

interface User {
  id: string;
  phone: string;
  country: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  referral_code: string;
  referred_by?: string;
  password_hash?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateBalance: (newBalance: number) => void;
  login: (phone: string, passwordHash: string, countryDialCode?: string) => Promise<void>;
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
          set({ user: { ...current, balance: newBalance } });
        }
      },
      login: async (phone, password, countryDialCode = '+225') => {
        const candidates = generatePhoneCandidates(phone, countryDialCode);
        
        let foundUsers: User[] = [];

        // 1. Recherche par correspondance exacte sur tous les formats possibles
        if (candidates.length > 0) {
          const { data: matchedUsers, error: queryError } = await supabase
            .from('users')
            .select('*')
            .in('phone', candidates);

          if (!queryError && matchedUsers && matchedUsers.length > 0) {
            foundUsers = matchedUsers;
          }
        }

        // 2. Recherche tolérante si aucun résultat (ex: numéros enregistrés avec espaces ou préfixes exotiques)
        if (foundUsers.length === 0) {
          const pureDigits = phone.replace(/\D/g, '');
          const sigDigits = pureDigits.slice(-8); // Les 8 derniers chiffres uniques de l'abonné
          if (sigDigits.length >= 7) {
            const { data: fallbackUsers } = await supabase
              .from('users')
              .select('*')
              .ilike('phone', `%${sigDigits}%`);

            if (fallbackUsers && fallbackUsers.length > 0) {
              foundUsers = fallbackUsers;
            }
          }
        }

        if (!foundUsers || foundUsers.length === 0) {
          throw new Error('Numéro de téléphone introuvable. Veuillez vérifier votre saisie ou créer un compte.');
        }

        // Si plusieurs correspondances sont trouvées, retenir celle dont le mot de passe correspond
        const matchedUser = foundUsers.find(u => u.password_hash === password);
        if (!matchedUser) {
          throw new Error('Mot de passe incorrect.');
        }

        try {
          sessionStorage.setItem('agritrans_show_welcome', 'true');
        } catch (e) {}

        set({ user: matchedUser, isAuthenticated: true });
      },
      register: async (phone, password, firstName = '', lastName = '', referralCode = '', country = "Côte d'Ivoire", countryDialCode = '+225') => {
        const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
        const dial = countryDialCode || '+225';
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `${dial}${cleanPhone}`;

        // Vérification préalable d'unicité avec tous les formats candidats
        const candidates = generatePhoneCandidates(fullPhone, dial);
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .in('phone', candidates)
          .limit(1);

        if (existing && existing.length > 0) {
          throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
        }

        // Generate unique referral code
        const genReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Check referrer
        let validReferrerCode: string | null = null;
        if (referralCode && referralCode.trim()) {
          const cleanRef = referralCode.trim();
          const { data: refUser } = await supabase
            .from('users')
            .select('id, referral_code')
            .eq('referral_code', cleanRef)
            .maybeSingle();

          if (refUser) {
            validReferrerCode = refUser.referral_code;
          } else {
            // Check if referral code is passed as an id
            const { data: refUserById } = await supabase
              .from('users')
              .select('id, referral_code')
              .eq('id', cleanRef)
              .maybeSingle();
            if (refUserById) {
              validReferrerCode = refUserById.referral_code;
            }
          }
        }

        const newUserPayload = {
          phone: fullPhone,
          password_hash: password,
          first_name: firstName || 'Partenaire',
          last_name: lastName || '',
          role: 'user',
          balance: 0,
          referral_code: genReferralCode,
          referred_by: validReferrerCode || (referralCode.trim() || null),
          country: country || "Côte d'Ivoire"
        };

        const { data: createdUser, error: insertError } = await supabase
          .from('users')
          .insert([newUserPayload])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        try {
          sessionStorage.setItem('agritrans_show_welcome', 'true');
        } catch (e) {}

        set({ user: createdUser, isAuthenticated: true });
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
        const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          if (user.password_hash && data.password_hash !== user.password_hash) {
            get().logout();
            return;
          }
          if (!data.referral_code) {
            const myReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();
            await supabase.from('users').update({ referral_code: myReferralCode }).eq('id', user.id);
            data.referral_code = myReferralCode;
          }
          set({ user: data });
        } else {
          get().logout();
        }
      }
    }),
    {
      name: 'translogis-auth',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
