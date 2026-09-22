import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbwmgiauoxuxouwowyml.supabase.com';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixExpirations() {
  console.log("Fetching all investments...");
  const { data: investments, error } = await supabase.from('investments').select('*');
  
  if (error) {
    console.error("Error fetching investments:", error);
    return;
  }
  
  if (!investments) return;
  
  console.log(`Found ${investments.length} investments. Updating end dates...`);
  
  for (const inv of investments) {
    // Calcul de la catégorie : si c'est ~18% c'est standard (8j), si c'est ~5% c'est premium (60j)
    const ratio = inv.plan_amount > 0 ? (inv.daily_yield / inv.plan_amount) : 0;
    const isStandard = ratio > 0.1; // ex: 0.18 for 18%
    const durationDays = isStandard ? 8 : 60;
    
    const startDate = new Date(inv.start_date || inv.created_at);
    const newEndDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    await supabase.from('investments')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', inv.id);
      
    console.log(`Updated investment ${inv.id}: ${durationDays} days. New end date: ${newEndDate.toISOString()}`);
  }
  console.log("Done updating end dates!");
}

fixExpirations();
