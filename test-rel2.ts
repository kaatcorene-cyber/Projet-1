import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ooekuyetmfgmpmwxtkpf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI'
);

async function test() {
  const { data, error } = await supabase.from('investments').select('*, users(first_name, last_name, phone)').limit(1);
  console.log(JSON.stringify({data, error}, null, 2));
}

test();
