import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  try {
    console.log('Deleting transactions...');
    await supabase.from('transactions').delete().not('id', 'eq', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.error('Error deleting transactions:', e);
  }
  
  try {
    console.log('Deleting investments...');
    await supabase.from('investments').delete().not('id', 'eq', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.error('Error deleting investments:', e);
  }
  
  let adminIds = [];
  try {
    console.log('Fetching admins...');
    const { data: adminUsers } = await supabase.from('users').select('id').eq('role', 'admin');
    adminIds = adminUsers?.map(u => u.id) || [];
  } catch (e) {
    console.error('Error fetching admins:', e);
  }
  
  try {
    console.log('Deleting non-admin users from users table...');
    if (adminIds.length > 0) {
      await supabase.from('users').delete().not('id', 'in', '(' + adminIds.join(',') + ')');
    } else {
      await supabase.from('users').delete().not('id', 'eq', '00000000-0000-0000-0000-000000000000');
    }
  } catch (e) {
    console.error('Error deleting users:', e);
  }

  try {
    console.log('Fetching auth users...');
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Auth users error:', error);
    } else if (authUsers && authUsers.users) {
      const usersToDelete = authUsers.users.filter(u => !adminIds.includes(u.id));
      for (const u of usersToDelete) {
         console.log('Deleting auth user', u.email);
         await supabase.auth.admin.deleteUser(u.id);
      }
    }
  } catch (e) {
    console.error('Error fetching/deleting auth users:', e);
  }
  
  try {
    console.log('Clearing investment plans...');
    await supabase.from('settings').update({ value: '[]' }).eq('key', 'investment_plans');
  } catch (e) {
    console.error('Error clearing plans:', e);
  }
  
  console.log('Done!');
}

wipe().catch(console.error);
