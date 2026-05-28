import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Default keys if none provided
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSupport() {
  const { error } = await supabase.from('settings').upsert([
    { key: 'support_link', value: 'https://wa.me/2250544051968' }
  ], { onConflict: 'key' });
  if (error) console.error(error);
  else console.log('Support link updated successfully!');
}
updateSupport();
