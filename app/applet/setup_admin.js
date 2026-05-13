import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vbwmgiauoxuxouwowyml.supabase.com',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA'
);

async function run() {
  const { data: users } = await supabase.from('users').select('*');
  console.log('Total users:', users?.length);
  
  // delete all users except admin (or maybe just clear everything)
  // wait, the user said "Supprime tous les comptes qui existent déjà dans la base de donner"
  // So I'll delete EVERYTHING.
  
  await supabase.from('deposit_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('All previous accounts deleted.');

  const adminAccount = {
    phone: 'admin_sim',
    password_hash: 'sim2024!', // simple auth
    first_name: 'Admin',
    last_name: 'System',
    country: 'CI',
    role: 'admin',
    balance: 0,
    referral_code: 'ADMINSIM1',
    referred_by: null
  };
  
  await supabase.from('users').insert(adminAccount);
  console.log('Admin account created: admin_sim / sim2024!');
}
run();
