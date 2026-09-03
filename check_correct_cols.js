import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else {
    console.log(error, data);
  }
}
main();
