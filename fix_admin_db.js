import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://vbwmgiauoxuxouwowyml.supabase.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA');

async function fixAdmin() {
  const { data: existing } = await supabase.from('users').select('*').eq('role', 'admin');
  if (existing && existing.length > 0) {
    for (const admin of existing) {
       await supabase.from('users').update({ phone: '0704752133', password_hash: 'Calmaress225@' }).eq('id', admin.id);
    }
    console.log('Updated existing admin');
  } else {
    await supabase.from('users').insert({
       phone: '0704752133',
       country: "Côte d'Ivoire",
       first_name: 'Admin',
       last_name: 'Olam Agri',
       password_hash: 'Calmaress225@',
       role: 'admin',
       balance: 0
    });
    console.log('Inserted new admin');
  }
}

fixAdmin();
