import { createClient } from '@supabase/supabase-js';

const oldDb = createClient(
  'https://ooekuyetmfgmpmwxtkpf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODEwOTksImV4cCI6MjA5MTY1NzA5OX0.kZfRMBtYt16sJz_876g-1R4Vf-iM44N0l4P9u0Btzp4'
);

async function migrate() {
  console.log("Fetching old settings with anon key...");
  const { data: oldSettings, error: fetchErr } = await oldDb.from('settings').select('*');
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }
  console.log(oldSettings);
}

migrate();
