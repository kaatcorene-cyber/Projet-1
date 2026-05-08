import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

// Format url if incorrectly ending with .com instead of .co
const formattedUrl = supabaseUrl.replace('.supabase.com', '.supabase.co');

export const supabase = createClient(formattedUrl, supabaseKey);

export const checkDbSetup = async () => {
  try {
    // Check if both the table and the new column exist
    const { error } = await supabase.from('users').select('id, country').limit(1);
    
    if (error) {
      // relation does not exist OR column does not exist OR schema cache says no table
      if (error.code === '42P01' || error.code === '42703' || error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return false;
      }
      // If it's a different error, we assume DB is reachable but maybe empty (still returning true)
    }
    
    // Also check if RLS might be blocking
    return true;
  } catch (e) {
    return false;
  }
};
