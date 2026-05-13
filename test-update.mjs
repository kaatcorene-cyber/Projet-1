import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// using env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy'; // Wait, let me just read from src/lib/supabase.ts

import fs from 'fs';
const libContent = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const urlMatch = libContent.match(/VITE_SUPABASE_URL\s*\|\|\s*'([^']+)'/);
const keyMatch = libContent.match(/VITE_SUPABASE_ANON_KEY\s*\|\|\s*'([^']+)'/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data, error } = await supabase.from('users').select('id, balance').limit(1);
  console.log("SELECT error:", error);
  if (data && data.length > 0) {
    const id = data[0].id;
    const { data: upData, error: upError } = await supabase.from('users').update({ balance: data[0].balance }).eq('id', id);
    console.log("UPDATE error:", upError?.message || upError || "OK");
  }
}
check();
