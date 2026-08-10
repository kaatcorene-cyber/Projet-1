const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('users').update({
    bank_method: null,
    bank_account_number: null,
    bank_account_name: null
  }).neq('id', 'dummy'); 
  
  if (error) console.error("Error updating users:", error);
  else console.log("Successfully cleared bank info from users table.");
  
  const { data: settingsData, error: settingsError } = await supabase.from('settings').delete().like('key', 'bank_%');
  
  if (settingsError) console.error("Error deleting bank settings:", settingsError);
  else console.log("Successfully deleted bank settings from settings table.");
}
run();
