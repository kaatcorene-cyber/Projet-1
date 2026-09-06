import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const hookCode = `
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

const FRUIT_IMAGES = [
  "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80", 
  "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"
];

const newPlans = [
  { amount: 2000, percent: 20, duration: 80, daily: 400, total: 32000, image: FRUIT_IMAGES[0] },
  { amount: 5000, percent: 20, duration: 80, daily: 1000, total: 80000, image: FRUIT_IMAGES[1] },
  { amount: 8000, percent: 20, duration: 80, daily: 1600, total: 128000, image: FRUIT_IMAGES[2] },
  { amount: 15000, percent: 20, duration: 80, daily: 3000, total: 240000, image: FRUIT_IMAGES[3] },
  { amount: 35000, percent: 20, duration: 80, daily: 7000, total: 560000, image: FRUIT_IMAGES[4] },
  { amount: 80000, percent: 20, duration: 80, daily: 16000, total: 1280000, image: FRUIT_IMAGES[5] },
  { amount: 200000, percent: 20, duration: 80, daily: 40000, total: 3200000, image: FRUIT_IMAGES[6] },
  { amount: 500000, percent: 20, duration: 80, daily: 100000, total: 8000000, image: FRUIT_IMAGES[7] }
];

export default function App() {
  useEffect(() => {
    const patchPlans = async () => {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'investment_plans').single();
        if (data && data.value) {
          const currentPlans = JSON.parse(data.value);
          if (currentPlans.length > 0 && currentPlans[0].amount !== 2000) {
             await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(newPlans) });
             console.log("Plans updated to new list");
          }
        } else {
             await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(newPlans) });
        }
      } catch (e) {
        console.error("Patch error", e);
      }
    };
    patchPlans();
  }, []);
`;

content = content.replace("export default function App() {", hookCode);
content = content.replace("import { Toaster } from 'react-hot-toast';", "import { Toaster } from 'react-hot-toast';\n");

fs.writeFileSync('src/App.tsx', content);
