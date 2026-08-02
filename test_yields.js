import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: investments } = await supabase.from('investments').select('*').eq('status', 'active');
    
    // Simulate what Layout does
    const { data: gains } = await supabase.from('transactions').select('reference').eq('type', 'daily_gain');

    let totalGains = 0;
    
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
        
        console.log(`User ${inv.user_id}, Inv ${inv.id}: Elapsed=${daysElapsed}, Paid=${paidCount}, Missed=${missedDays}`);
    }
}
check();
