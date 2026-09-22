import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vbwmgiauoxuxouwowyml.supabase.com',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA'
);

async function test() {
  const { data, error } = await supabase.from('investments').select('*, users(first_name, last_name, phone)');
  console.log("Investments:", data?.length, "Error:", error);
}

test();
