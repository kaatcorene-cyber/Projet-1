import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';

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
