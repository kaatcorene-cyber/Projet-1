import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateGroup() {
  const { error } = await supabase.from('settings').upsert([
    { key: 'group_link', value: 'https://chat.whatsapp.com/DKDo2qOfJRlF4n0J9tGxNt' }
  ], { onConflict: 'key' });
  if (error) console.error(error);
  else console.log('Group link updated successfully!');
}
updateGroup();
