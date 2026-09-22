import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: investments } = await supabase.from('investments').select('*').eq('status', 'active');
  
  if (!investments) {
      console.log('No active investments');
      return;
  }
  
  console.log(`Found ${investments.length} active investments.`);
  
  let totalUsers = new Set();
  
  for (const inv of investments) {
      const { data: gains } = await supabase.from('transactions')
          .select('reference')
          .eq('user_id', inv.user_id)
          .eq('type', 'daily_gain');
          
      const startDate = new Date(inv.start_date || inv.created_at || Date.now()).getTime();
      let effectiveNow = Date.now();
      let isExpired = false;
      if (inv.end_date) {
        const endTimestamp = new Date(inv.end_date).getTime();
        if (Date.now() >= endTimestamp) {
          effectiveNow = endTimestamp;
          isExpired = true;
        }
      }
      const daysElapsed = Math.floor((effectiveNow - startDate) / (24 * 60 * 60 * 1000));
      const paidCount = gains?.filter(g => g.reference === inv.id).length || 0;
      const missedDays = daysElapsed - paidCount;
      
      if (missedDays > 0) {
          console.log(`Investment ${inv.id} (user ${inv.user_id}) missed ${missedDays} days of ${inv.daily_yield} = ${missedDays * inv.daily_yield}`);
          let totalToAdd = inv.daily_yield * missedDays;
          
          const newTransactions = [];
          for (let i = 0; i < missedDays; i++) {
              newTransactions.push({
                  user_id: inv.user_id,
                  type: 'daily_gain',
                  amount: inv.daily_yield,
                  status: 'completed',
                  reference: inv.id
              });
          }
          
          await supabase.from('transactions').insert(newTransactions);
          
          const { data: userData } = await supabase.from('users').select('balance').eq('id', inv.user_id).single();
          if (userData) {
              await supabase.from('users').update({ balance: userData.balance + totalToAdd }).eq('id', inv.user_id);
          }
          totalUsers.add(inv.user_id);
      }
      
      if (isExpired) {
         await supabase.from('investments').update({ status: 'completed' }).eq('id', inv.id);
      }
  }
  
  console.log(`Fixed gains for ${totalUsers.size} users.`);
}

run();
