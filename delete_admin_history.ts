import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAdminHistory() {
  try {
    // get admin user
    const { data: admins, error: adminErr } = await supabase.from('users').select('id').eq('role', 'admin');
    if (adminErr) {
      console.error(adminErr);
      return;
    }
    
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        const { error: delErr } = await supabase.from('transactions').delete().eq('user_id', admin.id);
        if (delErr) {
          console.error(`Failed to delete transactions for admin ${admin.id}`, delErr);
        } else {
          console.log(`Deleted transactions for admin ${admin.id}`);
        }
      }
    } else {
      console.log('No admins found');
    }
  } catch (err) {
    console.error(err);
  }
}

clearAdminHistory();
