import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Default keys if none provided
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSupport() {
  const { error } = await supabase.from('settings').upsert([
    { key: 'support_link', value: 'https://wa.me/2250544051968' }
  ], { onConflict: 'key' });
  if (error) console.error(error);
  else console.log('Support link updated successfully!');
}
updateSupport();
