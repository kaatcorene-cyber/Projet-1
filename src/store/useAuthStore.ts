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
  bank_balance?: number;
  referral_code: string;
  referred_by?: string;
  investments?: any[];
  transactions?: any[];
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
      fetchProfile: async () => {
         const { user } = get();
         if (!user) return;
         await get().refreshUser();
      },
      refreshUser: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase.from('users').select('*, investments(*), transactions(*)').eq('id', user.id).single();
        if (data) {
          if (!data.referral_code) {
            let myReferralCode = data.first_name ? data.first_name.replace(/\s+/g, '').toUpperCase() : 'USER';
            let codeUnique = false;
            let finalCode = myReferralCode;
            
            while(!codeUnique) {
                const { data: existingRef } = await supabase.from('users').select('id').eq('referral_code', finalCode).maybeSingle();
                if (existingRef && existingRef.id !== user.id) {
                    finalCode = myReferralCode + Math.floor(Math.random() * 1000);
                } else {
                    codeUnique = true;
                }
            }
            
            await supabase.from('users').update({ referral_code: finalCode }).eq('id', user.id);
            data.referral_code = finalCode;
          }
          set({ user: data });
        }
      }
    }),
    {
      name: 'qualcomm-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user ? {
          ...state.user,
          investments: undefined,
          transactions: undefined
        } : null
      }),
    }
  )
);
