import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.co'; // using .co!
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAll() {
  console.log('Starting cleanup...');
  
  // Clean related tables first to avoid foreign key constraint errors
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleared transactions.');
  
  await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleared investments.');
  
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleared public users.');

  // Delete auth users
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    console.error('Error fetching auth users:', error);
    return;
  }
  
  console.log(`Found ${users.length} users to delete.`);
  for (const user of users) {
    const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
    if (delError) {
      console.error(`Failed to delete ${user.email}:`, delError);
    } else {
      console.log(`Deleted ${user.email}`);
    }
  }
  
  console.log('Cleanup complete!');
}

cleanAll();
