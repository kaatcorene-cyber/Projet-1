import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://vbwmgiauoxuxouwowyml.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('settings').select('*').eq('key', 'investment_plans').single();
  if (data) {
    console.log(data.value);
  } else {
    console.log(error);
  }
}
main();
