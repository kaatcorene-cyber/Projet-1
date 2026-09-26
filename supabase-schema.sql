-- Script d'initialisation complet pour l'éditeur SQL de Supabase (SQL Editor)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'Cote d''Ivoire',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  balance NUMERIC DEFAULT 100,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone, country)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='country') THEN
    ALTER TABLE users ADD COLUMN country TEXT DEFAULT 'Cote d''Ivoire';
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;
    ALTER TABLE users ADD CONSTRAINT users_phone_country_key UNIQUE (phone, country);
  END IF;
END
$$;

-- Désactiver RLS pour permettre le bon fonctionnement de l'application
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_amount NUMERIC NOT NULL,
  daily_yield NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  last_paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- deposit, withdrawal, investment, daily_gain, referral_bonus, signup_bonus
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deposit_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  sender_number TEXT,
  receipt_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_verifications DISABLE ROW LEVEL SECURITY;

-- Paramètres par défaut
INSERT INTO settings (key, value) VALUES 
  ('payment_link', 'https://payin.moneyfusion.net'),
  ('ussd_ci', '*144*4*6*1000#'),
  ('wave_number', '0704752133'),
  ('ussd_mtn_ci', '*133#'),
  ('support_link', 'https://wa.me/2250704752133'),
  ('whatsapp_support', 'https://wa.me/2250704752133'),
  ('telegram_link', 'https://t.me/agritrans_officiel')
ON CONFLICT (key) DO NOTHING;

-- Administrateur par défaut
INSERT INTO users (phone, country, first_name, last_name, password_hash, role, balance, referral_code)
VALUES ('+2250704752133', 'Cote d''Ivoire', 'Admin', 'AgriTrans', 'Calmaress225@', 'admin', 0, 'AGRIADMIN')
ON CONFLICT (phone, country) DO NOTHING;

