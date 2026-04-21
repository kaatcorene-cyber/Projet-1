import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Cleaning up old admin...");
  try {
    const { data: oldAdmins } = await supabase.from('users').select('id').eq('phone', '0000000000');
    if (oldAdmins && oldAdmins.length > 0) {
      for (const admin of oldAdmins) {
        await supabase.from('investments').delete().eq('user_id', admin.id);
        await supabase.from('transactions').delete().eq('user_id', admin.id);
        await supabase.from('users').delete().eq('id', admin.id);
        console.log(`Deleted old admin ${admin.id}`);
      }
    } else {
        console.log("No old admins found");
    }
  } catch (e) {
    console.error("Caught exception:", e);
  }
}

main();
