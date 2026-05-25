import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

async function main() {
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_method TEXT; ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name TEXT; ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number TEXT;"
  });
  console.log("Alter table via RPC:", error);
}
main();
