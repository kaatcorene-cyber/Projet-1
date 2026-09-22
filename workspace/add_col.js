import { supabase } from './src/lib/supabase.js';

async function main() {
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE investments ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'basique';"
  });
  console.log("Alter table via RPC:", error);

  // Fallback: If rpc doesn't work, just try updating directly. Wait, we can't alter table from JS without rpc, and if we don't have exec_sql we might be stuck.
  // Actually, wait, does setup support running arbitrary SQL?
  // Setup.tsx has a textarea to run sql!
}
main();
