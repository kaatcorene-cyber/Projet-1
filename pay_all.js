import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function payAll() {
    const { data: investments } = await supabase.from('investments').select('*').eq('status', 'active');
    const { data: gains } = await supabase.from('transactions').select('reference').eq('type', 'daily_gain');

    let newTransactions = [];
    let completedInvestments = [];
    let userBalances = {};

    for (const inv of investments) {
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
            if (!userBalances[inv.user_id]) userBalances[inv.user_id] = 0;
            userBalances[inv.user_id] += (inv.daily_yield * missedDays);
            
            for (let i = 0; i < missedDays; i++) {
                newTransactions.push({
                    user_id: inv.user_id,
                    type: 'daily_gain',
                    amount: inv.daily_yield,
                    status: 'completed',
                    reference: inv.id
                });
            }
        }
        
        if (isExpired) {
            completedInvestments.push(inv.id);
        }
    }

    if (newTransactions.length > 0) {
        // chunk transactions if too many
        for (let i=0; i<newTransactions.length; i+=500) {
           await supabase.from('transactions').insert(newTransactions.slice(i, i+500));
        }
        
        for (const userId of Object.keys(userBalances)) {
            const amountToAdd = userBalances[userId];
            const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
            if (userData) {
                await supabase.from('users').update({ balance: userData.balance + amountToAdd }).eq('id', userId);
            }
        }
        console.log(`Added ${newTransactions.length} transactions.`);
    } else {
        console.log("No new gains to pay.");
    }
    
    if (completedInvestments.length > 0) {
        for (const id of completedInvestments) {
            await supabase.from('investments').update({ status: 'completed' }).eq('id', id);
        }
        console.log(`Completed ${completedInvestments.length} investments.`);
    }
}
payAll();
