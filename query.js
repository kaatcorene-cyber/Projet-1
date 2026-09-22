import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://vbwmgiauoxuxouwowyml.supabase.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA');

async function run() {
  const { data } = await supabase.from('settings').select('*').eq('key', 'group_link');
  console.log("Existing data:", data);
  const { data: updateData, error } = await supabase.from('settings').upsert({ key: 'group_link', value: 'https://t.me/+ojAqyDFSzRJhZjVk' }, { onConflict: 'key' });
  console.log("Upserted:", error);
}
run();
