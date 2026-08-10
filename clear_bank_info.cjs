const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbwmgiauoxuxouwowyml.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA');

async function run() {
  // Update users table
  const { data, error } = await supabase.from('users').update({
    bank_method: null,
    bank_account_number: null,
    bank_account_name: null
  }).neq('id', 'dummy'); // match all
  
  if (error) console.error("Error updating users:", error);
  else console.log("Successfully cleared bank info from users table.");
  
  // Delete bank settings from settings table
  const { data: settingsData, error: settingsError } = await supabase.from('settings').delete().like('key', 'bank_%');
  
  if (settingsError) console.error("Error deleting bank settings:", settingsError);
  else console.log("Successfully deleted bank settings from settings table.");
}

run();
