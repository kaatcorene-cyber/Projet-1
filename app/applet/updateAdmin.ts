import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: 'mission01' })
    .eq('phone', '0000000000');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success!', data);
  }
}

main();
