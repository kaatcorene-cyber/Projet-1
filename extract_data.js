import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function extract() {
  const { data: users, error } = await supabase.from('users').select('id, phone, referral_code, referred_by');
  if (error) {
    console.error(error);
    return;
  }
  
  // Find all referrers (users who have at least one person referring them)
  const usersWithReferrers = users.filter(u => u.referred_by);
  
  // map referral_code to user
  const userMap = {};
  users.forEach(u => userMap[u.referral_code] = u);
  const userIdMap = {};
  users.forEach(u => userIdMap[u.id] = u);
  
  const results = [];
  
  for (const referredUser of usersWithReferrers) {
      const referrer = userMap[referredUser.referred_by];
      if (!referrer) continue; // Parrain not found in list (maybe deleted or code typo)
      
      // Check deposits of referredUser
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, status, type')
        .eq('user_id', referredUser.id)
        .eq('type', 'deposit')
        .eq('status', 'approved');
        
      const totalDeposits = txs ? txs.length : 0;
      const firstDepositAmount = totalDeposits > 0 ? txs[0].amount : 0;
      
      results.push({
          parrain_phone: referrer.phone,
          filleul_phone: referredUser.phone,
          a_recharge: totalDeposits > 0 ? "Oui" : "Non",
          montant_premier_depot: firstDepositAmount
      });
  }
  
  // Pretty print for agent to read
  console.log("=== LISTE DES PARRAINAGES ===");
  if(results.length === 0) {
      console.log("Aucun parrainage trouvé.");
  } else {
      results.forEach(r => {
          console.log(`Parrain: ${r.parrain_phone} | Filleul: ${r.filleul_phone} | Rechargé: ${r.a_recharge} | Montant: ${r.montant_premier_depot} FCFA`);
      });
  }
}

extract();
