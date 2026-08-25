import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vbwmgiauoxuxouwowyml.supabase.com',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA'
);

async function run() {
  const { data: existing } = await supabase.from('settings').select('*').eq('key', 'group_link').maybeSingle();
  if (existing) {
    console.log('Existing group_link found, updating it...');
    const { data, error } = await supabase.from('settings').update({ value: 'https://t.me/+TjOOMskz4qMyZjlk' }).eq('key', 'group_link');
    console.log('Update Result:', { error });
  } else {
    console.log('No existing group_link found. Inserting...');
    const { data, error } = await supabase.from('settings').insert([{ key: 'group_link', value: 'https://t.me/+TjOOMskz4qMyZjlk' }]);
    console.log('Insert Result:', { error });
  }
}
run();
