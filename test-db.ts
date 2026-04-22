import { supabase } from './src/lib/supabase';

async function test() {
  const { data, error } = await supabase.from('investments').select('*, users(first_name, last_name, phone)');
  console.log("Investments:", data, "Error:", error);
}

test();
