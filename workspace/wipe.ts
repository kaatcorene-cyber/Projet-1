import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  console.log('Deleting transactions...');
  await supabase.from('transactions').delete().neq('id', '000000');
  
  console.log('Deleting investments...');
  await supabase.from('investments').delete().neq('id', '000000');
  
  console.log('Deleting non-admin users from users table...');
  const { data: adminUsers } = await supabase.from('users').select('id').eq('role', 'admin');
  const adminIds = adminUsers?.map(u => u.id) || [];
  
  if (adminIds.length > 0) {
    await supabase.from('users').delete().not('id', 'in', `(${adminIds.join(',')})`);
  } else {
    // maybe there's an is_admin flag?
    await supabase.from('users').delete().eq('role', 'user');
  }
  
  console.log('Clearing investment plans...');
  await supabase.from('app_settings').update({ value: '[]' }).eq('key', 'investment_plans');
  
  console.log('Done!');
}

wipe().catch(console.error);
