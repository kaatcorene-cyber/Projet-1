import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const svg = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="#0ea5e9"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">L</text></svg>').toString('base64')}`;

const plans = [
  { amount: 5000, duration: 15, daily: 1000, total: 15000, percent: 20, image: svg },
  { amount: 15000, duration: 15, daily: 3000, total: 45000, percent: 20, image: svg },
  { amount: 40000, duration: 15, daily: 8000, total: 120000, percent: 20, image: svg },
  { amount: 90000, duration: 15, daily: 18000, total: 270000, percent: 20, image: svg },
  { amount: 200000, duration: 15, daily: 40000, total: 600000, percent: 20, image: svg }
];

async function main() {
  const { data, error } = await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(plans) });
  if (error) {
    console.error(error);
  } else {
    console.log("Plans mis à jour avec le logo SVG !");
  }
}
main();
