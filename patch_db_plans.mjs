import fs from 'fs';

const SUPABASE_URL = "https://vbwmgiauoxuxouwowyml.supabase.com";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA";

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

async function updateDb() {
  const url = `${SUPABASE_URL}/rest/v1/settings?key=eq.investment_plans`;
  
  const payload = {
    key: 'investment_plans',
    value: JSON.stringify(newPlans)
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
  
  if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
      // If it doesn't exist, we must POST
      const postUrl = `${SUPABASE_URL}/rest/v1/settings`;
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      console.log('POST Status:', postRes.status);
      console.log('POST Response:', await postRes.text());
  }
}

updateDb();
