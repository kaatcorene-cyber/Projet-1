import { supabase } from './src/lib/supabase.js';

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
