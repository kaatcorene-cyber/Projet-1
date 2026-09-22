import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: investments, error } = await supabase.from('investments').select('*');
  if (error) {
    console.error("Error fetching investments:", error);
    return;
  }
  
  if (!investments || investments.length === 0) {
    console.log("No investments found.");
    return;
  }
  
  let updatedCount = 0;
  for (const inv of investments) {
    const startDate = new Date(inv.start_date);
    const newEndDate = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    
    // We only update if it is different
    const { error: updateError } = await supabase.from('investments')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', inv.id);
      
    if (updateError) {
      console.error(`Error updating investment ${inv.id}:`, updateError);
    } else {
      updatedCount++;
    }
  }
  console.log(`Done updating ${updatedCount} investments.`);
}
run();
