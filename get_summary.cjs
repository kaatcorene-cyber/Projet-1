const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

async function main() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
  
  const usersByCode = new Map();
  for (const u of users) {
     if (u.referral_code) usersByCode.set(u.referral_code, u);
  }

  const usersWithRef = users.filter(u => u.referred_by);
  
  const stats = new Map(); 

  for (const u of usersWithRef) {
     const dateStr = u.created_at ? u.created_at.substring(0, 10) : '';
     if (dateStr.endsWith("-08-04")) {
         const deps = transactions.filter(t => t.user_id === u.id && t.type === 'deposit' && t.status === 'approved');
         const totalDep = deps.reduce((s, i) => s + Number(i.amount), 0);
         
         if (totalDep > 0) { 
             const ref = usersByCode.get(u.referred_by);
             const refKey = ref ? ref.phone : u.referred_by;
             const refName = ref ? `${ref.phone}` : u.referred_by;
             
             if (!stats.has(refKey)) {
                 stats.set(refKey, {
                     Parrain: refName,
                     Nb_Filleuls: 0,
                     Total_Recharge: 0
                 });
             }
             
             const stat = stats.get(refKey);
             stat.Nb_Filleuls += 1;
             stat.Total_Recharge += totalDep;
         }
     }
  }

  const results = Array.from(stats.values());
  if (results.length > 0) {
     console.table(results);
  } else {
     console.log("Aucun résultat.");
  }
}
main();
