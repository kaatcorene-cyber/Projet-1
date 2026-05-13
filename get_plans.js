import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('settings').select('*').eq('key', 'investment_plans');
  if(data && data.length > 0) {
    const plans = JSON.parse(data[0].value);
    const summary = plans.map(p => ({
        amount: p.amount,
        category: p.category,
        total: p.total,
        daily: p.daily,
        hasImage: !!p.image
    }));
    console.log(JSON.stringify(summary, null, 2));
  }
}
run();
