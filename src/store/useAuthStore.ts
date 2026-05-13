import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
      refreshUser: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data) {
          if (!data.referral_code) {
            const myReferralCode = (data.first_name?.substring(0, 3).toUpperCase() || 'USR') + Math.random().toString(36).substring(2, 6).toUpperCase();
            await supabase.from('users').update({ referral_code: myReferralCode }).eq('id', user.id);
            data.referral_code = myReferralCode;
          }
          set({ user: data });
        }
      }
    }),
    {
      name: 'qualcomm-auth'
    }
  )
);
