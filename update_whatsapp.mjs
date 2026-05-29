import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  "https://vbwmgiauoxuxouwowyml.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA"
);

async function run() {
  const link = 'https://chat.whatsapp.com/DKDo2qOfJRlF4n0J9tGxNt';
  
  // Check if it exists
  const { data: existing } = await supabase.from('settings').select('*').eq('key', 'group_link');
  
  if (existing && existing.length > 0) {
     const { error } = await supabase.from('settings').update({ value: link }).eq('key', 'group_link');
     console.log('Update result:', error || 'success');
  } else {
     const { error } = await supabase.from('settings').insert([{ key: 'group_link', value: link }]);
     console.log('Insert result:', error || 'success');
  }
}

run();
