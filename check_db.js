import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Using an RPC call or looking up `pg_tables` is not directly possible from `supabase-js`, 
  // but we can execute a REST API or check standard tables. 
  const { data: users, error: ue } = await supabase.from('users').select('*').limit(5);
  console.log("Users:", users);

  const { data: txs, error: te } = await supabase.from('transactions').select('*').limit(5);
  console.log("Txs:", txs);

  // If there's an error, log it
  if(ue) console.log(ue);
  if(te) console.log(te);
}
run();
