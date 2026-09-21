import { createClient } from '@supabase/supabase-js';

const getEnvOrStored = (key: string, storedKey: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storedKey);
      if (stored && stored.trim()) return stored.trim();
    } catch (e) {}
  }
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any)[key] : undefined;
  const procEnv = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  return metaEnv || procEnv || fallback;
};

const rawSupabaseUrl = getEnvOrStored('VITE_SUPABASE_URL', 'agritrans_supabase_url', 'https://gwkqmutjpxwjifaoutnt.supabase.co');
const supabaseKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'agritrans_supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk');

// Format url if incorrectly ending with .com instead of .co
const formattedUrl = rawSupabaseUrl.replace('.supabase.com', '.supabase.co');

export const supabase = createClient(formattedUrl, supabaseKey);

export const checkDbSetup = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const { error: usersError } = await supabase.from('users').select('id, country').limit(1).abortSignal(controller.signal);
    clearTimeout(timeoutId);
    
    if (usersError) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

