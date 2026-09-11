import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  settingsCache: any[] | null;
  setSettingsCache: (cache: any[]) => void;
  investmentsCache: any[] | null;
  setInvestmentsCache: (cache: any[]) => void;
  teamStatsCache: any | null;
  setTeamStatsCache: (cache: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settingsCache: null,
      setSettingsCache: (settingsCache) => set({ settingsCache }),
      investmentsCache: null,
      setInvestmentsCache: (investmentsCache) => set({ investmentsCache }),
      teamStatsCache: null,
      setTeamStatsCache: (teamStatsCache) => set({ teamStatsCache }),
    }),
    {
      name: 'soleil-app-storage',
    }
  )
);
