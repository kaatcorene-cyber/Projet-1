import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (const user of users) {
    if (user.referred_by && user.referred_by.match(/^[0-9+]{8,15}$/)) {
        // It's a phone number
        let cleanPhone = user.referred_by.replace(/\D/g, '');
        const { data: inviter } = await supabase.from('users').select('referral_code').eq('phone', cleanPhone).maybeSingle();
        if (inviter && inviter.referral_code) {
            console.log(`Updating user ${user.id} referred_by from ${user.referred_by} to ${inviter.referral_code}`);
            await supabase.from('users').update({ referred_by: inviter.referral_code }).eq('id', user.id);
            count++;
        }
    }
  }
  console.log(`Fixed ${count} users.`);
}

fix();
