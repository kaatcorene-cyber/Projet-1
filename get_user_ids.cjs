const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

function generateUserId(uuid) {
  if (!uuid) return '000000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString().substring(0, 6).padStart(6, '0');
}

async function main() {
  const phones = ['0707256005', '0504533646', '0709799337', '0151335425'];
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, phone, first_name, last_name')
    .in('phone', phones);
    
  if (error) {
    console.error(error);
    return;
  }
  
  const results = users.map(u => ({
    Phone: u.phone,
    Name: `${u.first_name} ${u.last_name}`,
    Profile_ID: generateUserId(u.id),
    UUID: u.id
  }));
  
  console.table(results);
}
main();
