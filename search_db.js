import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: settings } = await supabase.from('settings').select('*');
  console.log("Settings:");
  settings.forEach(s => {
    if (s.value && s.value.includes('qualcomm')) {
      console.log(`Found qualcomm in settings key: ${s.key}`);
    }
  });

  const { data: users } = await supabase.from('users').select('*');
  let found = false;
  users.forEach(u => {
    if (JSON.stringify(u).includes('qualcomm')) {
      console.log(`Found qualcomm in user: ${u.id}`);
      found = true;
    }
  });
  if (!found) console.log("No qualcomm found in users");
}
run();
