import { createClient } from '@supabase/supabase-js';
const url = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const sb = createClient(url, key);

async function run() {
  const { data: dbPlansStr } = await sb.from('settings').select('value').eq('key', 'investment_plans').single();
  let plans = dbPlansStr && dbPlansStr.value ? JSON.parse(dbPlansStr.value) : [];
  if (!plans.find(p => p.amount === 1500)) {
    plans.push({
      category: 'bonus',
      amount: 1500,
      daily: 180,
      total: 10800,
      duration: 60,
      image: '',
      isBonus: true
    });
    await sb.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(plans) });
    console.log("Added bonus plan.");
  } else {
    // Make sure properties are correct
    const idx = plans.findIndex(p => p.amount === 1500);
    plans[idx].isBonus = true;
    plans[idx].duration = 60;
    plans[idx].daily = 180;
    plans[idx].total = 180 * 60;
    plans[idx].category = 'bonus';
    await sb.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(plans) });
    console.log("Updated bonus plan.");
  }
}
run();
