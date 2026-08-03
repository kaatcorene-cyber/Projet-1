import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const phones = [
  '0505145116',
  '0779517474',
  '0171006232',
  '0757590588',
  '0709799337',
  '0151335425',
  '0758994300'
];

async function apply() {
  for (const phone of phones) {
    const { data: user } = await supabase.from('users').select('*').eq('phone', phone).single();
    if (user) {
      console.log(`User found: ${phone}`);
      
      // Update balance
      await supabase.from('users').update({ balance: Number(user.balance) + 3000 }).eq('id', user.id);
      
      // Insert tx
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: 3000,
        type: 'special_bonus',
        status: 'completed',
        reference: 'Bonus Spécial 3000F'
      });
      console.log(`Bonus applied for ${phone}`);
    }
  }
}

apply();
