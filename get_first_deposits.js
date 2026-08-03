import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getDeposits() {
  const { data: deposits, error } = await supabase
    .from('transactions')
    .select('*, users(phone, first_name, last_name)')
    .eq('type', 'deposit')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const userFirstDeposits = new Map();
  for (const d of deposits) {
    if (!userFirstDeposits.has(d.user_id)) {
      userFirstDeposits.set(d.user_id, d);
    }
  }

  const results = [];
  for (const [userId, firstDeposit] of userFirstDeposits.entries()) {
    // Check if the deposit date is today (August 3, 2026)
    // We check against the ISO string '2026-08-03'
    if (firstDeposit.created_at.includes('2026-08-03') && firstDeposit.amount >= 15000) {
       results.push({
           phone: firstDeposit.users?.phone,
           name: `${firstDeposit.users?.first_name || ''} ${firstDeposit.users?.last_name || ''}`.trim(),
           amount: firstDeposit.amount,
           date: firstDeposit.created_at
       });
    }
  }
  
  if (results.length === 0) {
      console.log("Aucun membre n'a fait de premier dépôt >= 15 000 FCFA aujourd'hui.");
  } else {
      console.log("=== PREMIERS DEPOTS >= 15000 AUJOURD'HUI ===");
      results.forEach(r => {
          console.log(`- Téléphone: **${r.phone}** | Nom: ${r.name} | Montant: **${r.amount} FCFA**`);
      });
  }
}

getDeposits();
