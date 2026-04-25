import { supabase } from './src/lib/supabase';

async function updateAll() {
  const { data: invs, error } = await supabase.from('investments').select('*');
  console.log("Found investments:", invs?.length, error);
  if (!invs) return;
  
  for (const inv of invs) {
    const end = new Date(inv.start_date);
    end.setDate(end.getDate() + 60);
    console.log(`Updating ${inv.id} from ${inv.end_date} to ${end.toISOString()}`);
    await supabase.from('investments').update({ end_date: end.toISOString() }).eq('id', inv.id);
  }
}
updateAll();
