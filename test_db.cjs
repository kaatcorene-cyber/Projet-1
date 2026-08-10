const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vbwmgiauoxuxouwowyml.supabase.com';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '...'; // I will use the service role key from additional instructions!
