import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AppState {
  settingsCache: any[] | null;
  setSettingsCache: (cache: any[]) => void;
  investmentsCache: any[] | null;
  setInvestmentsCache: (cache: any[]) => void;
  teamStatsCache: any | null;
  setTeamStatsCache: (cache: any) => void;
  config: any | null;
  fetchConfig: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  settingsCache: null,
  setSettingsCache: (settingsCache) => set({ settingsCache }),
  investmentsCache: null,
  setInvestmentsCache: (investmentsCache) => set({ investmentsCache }),
  teamStatsCache: null,
  setTeamStatsCache: (teamStatsCache) => set({ teamStatsCache }),
  config: null,
  fetchConfig: async () => {
     const { data } = await supabase.from('settings').select('*');
     if (data) {
       const settingsObj: any = {};
       data.forEach((item: any) => {
         settingsObj[item.key] = item.value;
       });
       set({ config: settingsObj, settingsCache: data });
     }
  }
}));
