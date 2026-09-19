import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../lib/storage';

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
  login: (phone: string, passwordHash: string) => Promise<void>;
  register: (phone: string, passwordHash: string, firstName?: string, lastName?: string, referralCode?: string) => Promise<void>;
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
      login: async (phone, password) => {
        // Clean national number
        const cleanPhone = phone.trim().replace(/\s+/g, '');
        // Standardize with +225 if not provided
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+225${cleanPhone}`;

        // Find user by phone in either format
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .or(`phone.eq.${fullPhone},phone.eq.${cleanPhone}`)
          .maybeSingle();

        if (error || !user) {
          throw new Error('Numéro de téléphone introuvable');
        }

        if (user.password_hash !== password) {
          throw new Error('Mot de passe incorrect');
        }

        set({ user, isAuthenticated: true });
      },
      register: async (phone, password, firstName = '', lastName = '', referralCode = '') => {
        const cleanPhone = phone.trim().replace(/\s+/g, '');
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+225${cleanPhone}`;

        // Check if user already exists
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .or(`phone.eq.${fullPhone},phone.eq.${cleanPhone}`)
          .maybeSingle();

        if (existing) {
          throw new Error('Ce numéro de téléphone est déjà associé à un compte.');
        }

        // Generate unique referral code
        const genReferralCode = 'TL' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Check referrer
        let referrerId: string | null = null;
        if (referralCode) {
          const { data: refUser } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', referralCode.trim())
            .maybeSingle();

          if (refUser) {
            referrerId = refUser.id;
          }
        }

        const newUserPayload = {
          phone: fullPhone,
          password_hash: password,
          first_name: firstName || 'Chauffeur/Partenaire',
          last_name: lastName || '',
          role: 'user',
          balance: 0,
          referral_code: genReferralCode,
          referred_by: referralCode.trim() || undefined,
          referrer_id: referrerId || undefined,
          country: "Côte d'Ivoire"
        };

        const { data: createdUser, error: insertError } = await supabase
          .from('users')
          .insert([newUserPayload])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        set({ user: createdUser, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
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
