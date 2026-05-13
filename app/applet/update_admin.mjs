import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Try to find the old admin record
  const { data: oldAdmin } = await supabase.from('users').select('*').eq('phone', '0000000000').single();
  
  if (oldAdmin) {
    console.log('Old admin found! Updating to new credentials...');
    const { error } = await supabase.from('users').update({
      phone: 'mission01',
      password_hash: 'admin123',
      country: "Cote d'Ivoire", // Set properly so rules match
      first_name: 'Admin',
      last_name: 'Mission'
    }).eq('id', oldAdmin.id);
    
    if (error) console.error('Error updating old admin:', error);
    else console.log('Successfully updated old admin to mission01');
  } else {
    const { data: currentAdmin } = await supabase.from('users').select('*').eq('phone', 'mission01').single();
    if(currentAdmin) {
        console.log('mission01 already exists, making sure it has admin123 password and admin role...');
        await supabase.from('users').update({
            password_hash: 'admin123',
            role: 'admin'
        }).eq('id', currentAdmin.id);
    } else {
        console.log('Old admin not found and mission01 not found. Creating new admin...');
        const { error } = await supabase.from('users').insert([{
        phone: 'mission01',
        password_hash: 'admin123',
        country: "Cote d'Ivoire",
        role: 'admin',
        first_name: 'Admin',
        last_name: 'Mission',
        balance: 1000000
        }]);
        if (error) console.error('Error creating new admin:', error);
        else console.log('Successfully created mission01 admin');
    }
  }

  await supabase.from('users').delete().eq('phone', '0000000000');
  console.log('Cleanup completed');
}

main();
