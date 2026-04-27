import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  console.log("Tx Select:", error ? error.message : "OK");

  const { data: d2, error: e2 } = await supabase.from('transactions').update({ status: 'approved' }).eq('id', 'some-id');
  console.log("Tx Update:", e2 ? e2.message : "OK");
  
  const { data: d3, error: e3 } = await supabase.from('users').update({ balance: 0 }).eq('id', 'some-id');
  console.log("Users Update:", e3 ? e3.message : "OK");
  
  const { data: d4, error: e4 } = await supabase.from('investments').delete().eq('id', 'some-id');
  console.log("Investments Delete:", e4 ? e4.message : "OK");
}

check();
