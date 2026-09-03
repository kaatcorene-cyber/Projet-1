import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase.from('settings').select('*').eq('key', 'investment_plans').single();
  const plans = JSON.parse(data.value);
  plans.forEach(p => {
    console.log(`Prix: ${p.amount} FCFA, Durée: ${p.duration || 60} Jours, Gain journalier: ${p.daily} FCFA, Gain Total: ${p.total} FCFA`);
  });
}
main();
