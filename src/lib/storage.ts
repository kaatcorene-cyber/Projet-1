/**
 * Safe storage wrapper to prevent QuotaExceededError crashes
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key}:`, e);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      console.warn(`[Storage] Quota exceeded or error saving ${key}. Purging non-essential caches...`, e);
      // Attempt recovery by purging non-critical cached data
      purgeNonEssentialStorage();
      try {
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.warn(`[Storage] Failed after purge to save ${key}:`, retryError);
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove ${key}:`, e);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[Storage] Failed to clear localStorage:', e);
    }
  }
};

/**
 * Remove heavy cached items that cause quota exhaustion
 * while preserving authentication tokens
 */
export function purgeNonEssentialStorage() {
  const nonEssentialKeys = [
    'soleil-app-storage',
    'support_chat_history',
    'support_verif_state',
    'cargill_investment_plans',
    'telegramModalShown'
  ];

  nonEssentialKeys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  });

  // Also check all keys in localStorage for oversized items (>100KB) that are not auth
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !key.includes('auth') && !key.includes('sb-') && !key.includes('token')) {
        const val = localStorage.getItem(key);
        if (val && val.length > 50000) { // >50KB
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {}
}

// Auto-run cleanup on initial import
purgeNonEssentialStorage();
