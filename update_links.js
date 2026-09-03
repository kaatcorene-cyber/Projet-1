import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  await supabase.from('settings').upsert({ key: 'group_link', value: 'https://t.me/+Xr9La2nZ2YAyNDc8' });
  await supabase.from('settings').upsert({ key: 'support_link', value: 'https://t.me/OlamAgri_Agt' });
  console.log('Links updated.');
}

run();
