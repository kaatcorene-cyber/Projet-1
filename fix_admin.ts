import { createClient } from '@supabase/supabase-js';

// Use the URL from src/lib/supabase.ts
const SUPABASE_URL = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Starting DB update...");
  try {
    const { data: currentAdmin, error: fetchErr } = await supabase.from('users').select('*').eq('phone', 'mission01').maybeSingle();
    console.log("Check existing mission01:", currentAdmin, fetchErr);

    if (currentAdmin) {
        console.log('mission01 already exists, updating...');
        const { error } = await supabase.from('users').update({
            password_hash: 'admin123',
            role: 'admin',
            country: "Cote d'Ivoire"
        }).eq('id', currentAdmin.id);
        console.log("Update error:", error);
    } else {
        console.log('Creating mission01 admin...');
        const { error } = await supabase.from('users').insert([{
            phone: 'mission01',
            password_hash: 'admin123',
            country: "Cote d'Ivoire",
            role: 'admin',
            first_name: 'Admin',
            last_name: 'Mission',
            balance: 1000000
        }]);
        console.log("Insert result error:", error);
    }

    const { error: delErr } = await supabase.from('users').delete().eq('phone', '0000000000');
    console.log("Delete old admin error:", delErr);
    console.log("Done!");
  } catch (e) {
    console.error("Caught exception:", e);
  }
}

main();
