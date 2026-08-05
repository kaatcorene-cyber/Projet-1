const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vbwmgiauoxuxouwowyml.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA'
);

async function main() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  if (userError) return console.error('User error:', userError);

  const { data: investments, error: invError } = await supabase.from('investments').select('*');
  if (invError) return console.error('Inv error:', invError);

  const targetDateStr = '2026-08-04';
  const targetDateStr2 = '2024-08-04'; 

  const results = [];
  const usersMap = new Map(users.map(u => [u.id, u]));

  for (const user of users) {
    if (!user.referred_by) continue;
    
    // Since August 4 is in local time, check the formatted string or just matching substring
    const dateStr = user.created_at.substring(0, 10);
    
    if (dateStr === targetDateStr || dateStr === targetDateStr2) {
      const referrer = usersMap.get(user.referred_by);
      if (!referrer) continue;

      const userInvestments = investments.filter(i => i.user_id === user.id);
      if (userInvestments.length > 0) {
        const totalInvested = userInvestments.reduce((sum, inv) => sum + Number(inv.plan_amount), 0);
        results.push({
          "Parrain": `${referrer.first_name} ${referrer.last_name} (${referrer.phone})`,
          "Filleul": `${user.first_name} ${user.last_name} (${user.phone})`,
          "Montant Investi (FCFA)": totalInvested,
          "Date d'inscription": dateStr
        });
      }
    }
  }

  if (results.length === 0) {
    console.log("Aucun parrainage correspondant trouvé pour le 4 Août.");
  } else {
    console.table(results);
  }
}

main();
