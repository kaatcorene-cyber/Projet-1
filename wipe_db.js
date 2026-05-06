import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdmin() {
  console.log('Adding admin user...');
  const { error } = await supabase.from('users').insert({
    phone: '0000000000',
    country: "Cote d'Ivoire",
    first_name: 'Admin',
    last_name: 'SOLEIL-POWER',
    password_hash: 'admin123',
    role: 'admin',
    balance: 0
  });

  if (error) {
    console.error('Error adding admin:', error);
  } else {
    console.log('Successfully added admin!');
  }
}

addAdmin();
