import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: settings, error } = await supabase.from('settings').select('*');
  if (error) {
    console.error(error);
    return;
  }
  for (const s of settings || []) {
    if (s.key === 'support_link') {
      console.log("Support Link:", s.value);
    }
    if (s.key === 'group_link') {
      console.log("Group Link:", s.value);
    }
  }
}

run();
