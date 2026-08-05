const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

async function main() {
  const adminId = 'b3a2f280-34ad-4528-b373-38dd3ba0e063';
  
  // 25 hours ago
  const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase.from('investments').insert([{
    user_id: adminId,
    plan_amount: 5000,
    daily_yield: 250,
    start_date: pastDate,
    last_paid_at: pastDate,
    status: 'active'
  }]);
  
  if (error) {
    console.error(error);
  } else {
    console.log("Investissement test ajouté pour l'admin.");
  }
}
main();
