import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const plans = [
  { amount: 5000, duration: 15, daily: 1000, total: 15000, percent: 20, image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800" },
  { amount: 15000, duration: 15, daily: 3000, total: 45000, percent: 20, image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" },
  { amount: 40000, duration: 15, daily: 8000, total: 120000, percent: 20, image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800" },
  { amount: 90000, duration: 15, daily: 18000, total: 270000, percent: 20, image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800" },
  { amount: 200000, duration: 15, daily: 40000, total: 600000, percent: 20, image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800" }
];

async function main() {
  const { data, error } = await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(plans) });
  if (error) {
    console.error(error);
  } else {
    console.log("Plans mis à jour avec succès !");
  }
}
main();
