import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbwmgiauoxuxouwowyml.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Starting deletion...');
  
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .eq('phone', 'admin_sim');
    
  if (userError) {
    console.error('Error deleting user:', userError);
  } else {
    console.log('User admin_sim deleted successfully.');
  }
  
  const { error: txError } = await supabase
    .from('transactions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (txError) {
    console.error('Error deleting transactions:', txError);
  } else {
    console.log('All transactions deleted successfully.');
  }
}

run();
