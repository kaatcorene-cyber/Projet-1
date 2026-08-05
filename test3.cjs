const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vbwmgiauoxuxouwowyml.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA'
);

async function main() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  console.log(`Total users: ${users ? users.length : 0}`);
}
main();
