import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// Usually supabase connection string is postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
// I can derive connection string from the service role key ? No. But the URL is https://vbwmgiauoxuxouwowyml.supabase.com
// So project ref is vbwmgiauoxuxouwowyml
// But wait, I don't have the password! So I cannot connect using `postgres` package!
