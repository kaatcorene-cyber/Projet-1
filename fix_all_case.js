import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data: users, error } = await supabase.from('users').select('id, referral_code, referred_by');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (const user of users) {
    let updates = {};
    if (user.referral_code && user.referral_code !== user.referral_code.toUpperCase()) {
        updates.referral_code = user.referral_code.toUpperCase();
    }
    if (user.referred_by && user.referred_by !== user.referred_by.toUpperCase()) {
        updates.referred_by = user.referred_by.toUpperCase();
    }
    
    if (Object.keys(updates).length > 0) {
        await supabase.from('users').update(updates).eq('id', user.id);
        count++;
    }
  }
  console.log(`Fixed ${count} users.`);
}

fix();
