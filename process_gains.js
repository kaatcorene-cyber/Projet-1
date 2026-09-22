import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

let script = `
  const processDailyGains = async () => {
    if (!user || activeInvestments.length === 0) return;
    
    let totalGained = 0;
    const now = new Date().getTime();
    
    // Fetch fresh investments from db
    const { data: invs } = await supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active');
    if (!invs) return;
    
    for (const inv of invs) {
      const start = new Date(inv.start_date || inv.created_at).getTime();
      const lastPaid = new Date(inv.last_paid_at || inv.created_at).getTime();
      
      const totalDaysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
      const lastPaidDaysElapsed = Math.floor((lastPaid - start) / (24 * 60 * 60 * 1000));
      
      const missingDays = totalDaysElapsed - lastPaidDaysElapsed;
      
      if (missingDays > 0) {
        // Calculate new lastPaid
        const newLastPaid = new Date(start + totalDaysElapsed * 24 * 60 * 60 * 1000).toISOString();
        const amountToAdd = inv.daily_yield * missingDays;
        totalGained += amountToAdd;
        
        await supabase.from('investments').update({ last_paid_at: newLastPaid }).eq('id', inv.id);
        
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'daily_gain',
          amount: amountToAdd,
          status: 'completed',
          reference: \`Gain \${missingDays} jours (plan)\`
        });
        
        // check expiration
        if (inv.end_date) {
           const endT = new Date(inv.end_date).getTime();
           if (now >= endT || totalDaysElapsed >= (new Date(inv.end_date).getTime() - start) / (24 * 60 * 60 * 1000)) {
               await supabase.from('investments').update({ status: 'completed' }).eq('id', inv.id);
           }
        }
      }
    }
    
    if (totalGained > 0) {
      const { data: usr } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (usr) {
        await supabase.from('users').update({ balance: Number(usr.balance) + totalGained }).eq('id', user.id);
        refreshUser();
      }
      fetchData();
    }
  };
`;

content = content.replace("const fetchData = async () => {", script + "\n\n  const fetchData = async () => {");
content = content.replace("onTickZero={() => window.location.reload()}", "onTickZero={() => processDailyGains()}");

// Adjust dashboard HTML
content = content.replace('<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Centres d\'aide</h3>', '');

// make text smaller for quick links
content = content.replace(/<span className="text-xs font-black text-gray-900/g, '<span className="text-[10px] font-black text-gray-900');

fs.writeFileSync('src/pages/Dashboard.tsx', content);

// Now for 'fetchData', ensure processDailyGains is called initially too so it processes backwards on load
fs.writeFileSync('dashboard_patch.js', 'done');
