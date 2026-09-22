import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ooekuyetmfgmpmwxtkpf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI'); // service

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_table_rls', { table_name: 'settings' });
  console.log(data, error);
}

// Alternatively, let's just create an anon JWT and try to write?
// Supabase REST endpoint doesn't trivially return RLS status.
// But we can just use supabase-schema.sql to re-disable it directly via postgres!
