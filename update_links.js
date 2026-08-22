import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  await supabase.from('settings').upsert({ key: 'group_link', value: 'https://t.me/+84LEZgG2c8A5MzRk' }, { onConflict: 'key' });
  await supabase.from('settings').upsert({ key: 'support_link', value: 'https://t.me/GraceRaphaelle' }, { onConflict: 'key' });
  console.log("Updated links");
}
run();
