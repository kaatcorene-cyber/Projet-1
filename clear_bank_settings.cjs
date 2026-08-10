const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Deleting bank settings...");
  const { data: settingsData, error: settingsError } = await supabase.from('settings').delete().like('key', 'bank_%');
  
  if (settingsError) console.error("Error deleting bank settings:", settingsError);
  else console.log("Successfully deleted bank settings from settings table.", settingsData);
}
run();
