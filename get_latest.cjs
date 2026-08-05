const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwkqmutjpxwjifaoutnt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk'
);

async function main() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  const { data: investments, error: invError } = await supabase.from('investments').select('*');
  const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
  
  if (userError) return console.error(userError);

  const usersByCode = new Map();
  for (const u of users) {
     if (u.referral_code) usersByCode.set(u.referral_code, u);
  }

  const usersWithRef = users.filter(u => u.referred_by);
  usersWithRef.sort((a,b) => b.created_at.localeCompare(a.created_at));

  const results = [];

  for (const u of usersWithRef) {
     const dateStr = u.created_at ? u.created_at.substring(0, 10) : '';
     if (dateStr.endsWith("-08-04")) {
         const invs = investments.filter(i => i.user_id === u.id);
         const deps = transactions.filter(t => t.user_id === u.id && t.type === 'deposit' && t.status === 'approved');
         
         const totalInv = invs.reduce((s, i) => s + Number(i.plan_amount), 0);
         const totalDep = deps.reduce((s, i) => s + Number(i.amount), 0);
         
         if (totalInv > 0 || totalDep > 0) {
             const ref = usersByCode.get(u.referred_by);
             results.push({
                "Parrain": ref ? `${ref.first_name} ${ref.last_name} (${ref.phone})` : u.referred_by,
                "Filleul": `${u.first_name} ${u.last_name} (${u.phone})`,
                "Rechargé (FCFA)": totalDep,
                "Investi (FCFA)": totalInv,
                "Date": dateStr
             });
         }
     }
  }

  if (results.length > 0) {
     console.table(results);
  } else {
     console.log("Aucun filleul du 4 Août ayant investi ou rechargé.");
  }
}
main();
