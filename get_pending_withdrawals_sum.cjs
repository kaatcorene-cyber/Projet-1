const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

async function main() {
  const { data: withdrawals, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'withdrawal')
    .eq('status', 'pending');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const totalAmount = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalAfterFee = totalAmount * 0.90; // deducting 10% fee
  
  console.log(`Nombre de retraits en cours: ${withdrawals.length}`);
  console.log(`Montant total brut: ${totalAmount} FCFA`);
  console.log(`Montant total net (après frais 10%): ${totalAfterFee} FCFA`);
}
main();
