const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function purge() {
  console.log('Purging transactions...');
  await supabase.from('transactions').delete().neq('id', 'dummy');
  
  console.log('Purging investments...');
  await supabase.from('investments').delete().neq('id', 'dummy');
  
  console.log('Purging verifications...');
  await supabase.from('deposit_verifications').delete().neq('id', 'dummy');
  
  console.log('Purging users (except admin)...');
  await supabase.from('users').delete().neq('phone', 'admin_sim');

  console.log('Done!');
}

purge().catch(console.error);
