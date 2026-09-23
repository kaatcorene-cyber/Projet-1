import { createClient } from '@supabase/supabase-js';

const NEW_PROJECT_REF = 'jnuizhkesxwzpgpycfch';
const NEW_PROJECT_URL = 'https://jnuizhkesxwzpgpycfch.supabase.co';

const getEnvOrStored = (key: string, storedKey: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storedKey);
      // Nettoyer automatiquement les anciennes clés de l'ancien projet obsolète
      if (stored && (stored.includes('gwkqmutjpxwjifaoutnt') || stored.includes('ooekuyetmfgmpmwxtkpf'))) {
        localStorage.removeItem(storedKey);
      } else if (stored && stored.trim()) {
        return stored.trim();
      }
    } catch (e) {}
  }
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any)[key] : undefined;
  const procEnv = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  
  if (metaEnv && !metaEnv.includes('gwkqmutjpxwjifaoutnt')) return metaEnv;
  if (procEnv && !procEnv.includes('gwkqmutjpxwjifaoutnt')) return procEnv;
  return fallback;
};

const rawSupabaseUrl = getEnvOrStored('VITE_SUPABASE_URL', 'agritrans_supabase_url', NEW_PROJECT_URL);
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWl6aGtlc3h3enBncHljZmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYwMDAwMDAsImV4cCI6MjAyMDYwMDAwMH0.placeholder';
const supabaseKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'agritrans_supabase_key', defaultKey);

// Format url if incorrectly ending with .com instead of .co
const formattedUrl = rawSupabaseUrl.replace('.supabase.com', '.supabase.co');

export const supabase = createClient(formattedUrl, supabaseKey);

export const checkDbSetup = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
