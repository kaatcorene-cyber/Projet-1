import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateReport() {
    // 1. Total users
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    // 2. Deposits (approved)
    const { data: deposits } = await supabase.from('transactions').select('user_id, amount').eq('type', 'deposit').eq('status', 'approved');
    
    // 3. Withdrawals (approved)
    const { data: withdrawals } = await supabase.from('transactions').select('user_id, amount').eq('type', 'withdrawal').eq('status', 'approved');

    const totalDepositsGross = deposits.reduce((acc, d) => acc + Number(d.amount), 0);
    const uniqueDepositors = new Set(deposits.map(d => d.user_id)).size;
    
    const totalWithdrawalsGross = withdrawals.reduce((acc, w) => acc + Number(w.amount), 0);
    
    // Calculate 3% fee on deposits
    // Assuming the deposited amount is the base on which 3% is calculated.
    const depositFees = totalDepositsGross * 0.03;
    const actualCashReceived = totalDepositsGross; // If the 3% is added on top, or taken from it? Let's report both.
    
    // Calculate 10% fee on withdrawals
    const withdrawalFees = totalWithdrawalsGross * 0.10;
    const actualCashSent = totalWithdrawalsGross - withdrawalFees;
    
    const balanceInCaisse = totalDepositsGross - actualCashSent;
    
    console.log("=== RAPPORT FINANCIER ===");
    console.log(`Membres Inscrits: ${totalUsers}`);
    console.log(`Membres ayant rechargé: ${uniqueDepositors}`);
    console.log(`Total Rechargé (Brut): ${totalDepositsGross} FCFA`);
    console.log(`Frais de recharge (3%): ${depositFees} FCFA`);
    console.log(`Total Retraits (Brut): ${totalWithdrawalsGross} FCFA`);
    console.log(`Frais de retrait (10%): ${withdrawalFees} FCFA`);
    console.log(`Total Net Envoyé aux Membres: ${actualCashSent} FCFA`);
    console.log(`---`);
    console.log(`Montant Final dans la Caisse (Total Rechargé - Total Net Envoyé): ${balanceInCaisse} FCFA`);
    
    // Also consider if the 3% fee on recharge is paid OUT to the network, then the net cash is Total Rechargé - 3% - Total Net Envoyé
    const balanceInCaisseMinusDepositFees = totalDepositsGross - depositFees - actualCashSent;
    console.log(`Montant Final dans la Caisse (Si les 3% sont des frais réseau déduits): ${balanceInCaisseMinusDepositFees} FCFA`);
}

generateReport();
