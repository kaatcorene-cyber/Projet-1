import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vbwmgiauoxuxouwowyml.supabase.com';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid21naWF1b3h1eG91d293eW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMzNjgyMSwiZXhwIjoyMDg5OTEyODIxfQ.y4hMA8i26UYz7M97oX4baD2XhKIXn3uxCfdKIPwGJwA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (const user of users) {
    if (user.referred_by && user.referred_by.match(/^[0-9+]{8,15}$/)) {
        // It's a phone number
        // Try to find the inviter
        let cleanPhone = user.referred_by.replace(/\D/g, '');
        const { data: inviter } = await supabase.from('users').select('referral_code').eq('phone', cleanPhone).maybeSingle();
        if (inviter && inviter.referral_code) {
            console.log(`Updating user ${user.id} referred_by from ${user.referred_by} to ${inviter.referral_code}`);
            await supabase.from('users').update({ referred_by: inviter.referral_code }).eq('id', user.id);
            count++;
        }
    }
  }
  console.log(`Fixed ${count} users.`);
}

fix();
