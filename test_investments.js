import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: investments } = await supabase.from('investments').select('*');
  console.log(`Total investments: ${investments ? investments.length : 0}`);
  if (investments && investments.length > 0) {
      console.log('Statuses:', [...new Set(investments.map(i => i.status))]);
  }
}

run();
