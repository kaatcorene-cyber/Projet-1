import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const libContent = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const urlMatch = libContent.match(/VITE_SUPABASE_URL\s*\|\|\s*'([^']+)'/);
const keyMatch = libContent.match(/VITE_SUPABASE_ANON_KEY\s*\|\|\s*'([^']+)'/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function simulateDeposit() {
  // get a pending deposit
  const { data: txs, error: txsErr } = await supabase.from('transactions').select('*').eq('type', 'deposit').eq('status', 'pending');
  console.log("Pending deposits:", txs?.length, txsErr);

  if (txs && txs.length > 0) {
    const tx = txs[0];
    const userId = tx.user_id;
    const amount = Number(tx.amount);
    
    console.log("Processing tx:", tx);
    
    // Simulate query:
    const { data: userData, error: uErr } = await supabase.from('users').select('balance, referred_by').eq('id', userId).single();
    console.log("Userdata fetch:", userData, uErr);
    
    if (userData) {
      const { error: upErr } = await supabase.from('users').update({ balance: Number(userData.balance) + amount }).eq('id', userId);
      console.log("Update user balance:", upErr?.message || "OK");
      
      const { count, error: cErr } = await supabase.from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'deposit')
            .eq('status', 'approved');
      console.log("Count previous approved deposits:", count, cErr);
    }
    
    const { error: txUpErr } = await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id);
    console.log("Tx update status:", txUpErr?.message || "OK");
  } else {
    // maybe create a mock one
    console.log("No pending deposits found to test.");
  }
}

simulateDeposit();
