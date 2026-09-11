import { createClient } from '@supabase/supabase-js';

const url = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

async function run() {
  const sb = createClient(url, key);
  const { data, error } = await sb.from('users').delete().eq('phone', 'superadmin');
  console.log('Deleted superadmin:', data, error);
}
run();
