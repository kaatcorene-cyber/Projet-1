import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('settings').select('*').eq('key', 'investment_plans');
  if(data && data.length > 0) {
    const oldPlans = JSON.parse(data[0].value);
    
    // helper to find best matching image
    function getImageForAmount(amt) {
      const match = oldPlans.find(p => p.amount === amt);
      if (match && match.image) return match.image;
      if (oldPlans.length > 0 && oldPlans[0].image) return oldPlans[0].image;
      return "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800";
    }

    const newPlansDef = [
      { amount: 2500, daily: 450 },
      { amount: 5000, daily: 900 },
      { amount: 10000, daily: 1800 },
      { amount: 15000, daily: 2700 },
      { amount: 20000, daily: 3600 },
      { amount: 30000, daily: 5400 },
      { amount: 40000, daily: 7200 },
      { amount: 50000, daily: 9000 },
      { amount: 75000, daily: 13500 },
      { amount: 100000, daily: 18000 }
    ];

    const newPlans = newPlansDef.map(p => ({
      ...p,
      category: 'unique',
      total: p.daily * 60,
      image: getImageForAmount(p.amount)
    }));

    await supabase.from('settings').update({ value: JSON.stringify(newPlans) }).eq('key', 'investment_plans');
    console.log("Updated investment plans in database successfully!");
  } else {
    console.error("No plans found in database or error", error);
  }
}
run();
