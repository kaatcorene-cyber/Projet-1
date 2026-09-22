import { supabase } from './src/lib/supabase';

async function main() {
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number TEXT;"
  });
  console.log("Alter table via RPC:", error);
}
main();
