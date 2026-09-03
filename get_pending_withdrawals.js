import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: withdrawals, error } = await supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'pending');
  if (error) {
    console.error(error);
    return;
  }
  let total = 0;
  for (const w of withdrawals || []) {
    total += w.amount;
  }
  console.log("Total pending withdrawals (raw):", total);
  console.log("Total pending withdrawals (minus 10%):", total * 0.9);
}

run();
