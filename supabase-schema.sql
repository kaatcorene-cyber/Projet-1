-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'Benin',
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
    ALTER TABLE users ADD COLUMN country TEXT DEFAULT 'Benin';
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;
    ALTER TABLE users ADD CONSTRAINT users_phone_country_key UNIQUE (phone, country);
  END IF;
END
$$;

-- IMPORTANT: Disable RLS for the prototype so API calls don't get blocked
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_amount NUMERIC NOT NULL,
  daily_yield NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  last_paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
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

ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

INSERT INTO settings (key, value) VALUES ('payment_link', 'https://bkapay.com/merchant/20cf6268') ON CONFLICT DO NOTHING;

INSERT INTO users (phone, country, first_name, last_name, password_hash, role, balance)
VALUES ('0000000000', 'Benin', 'Admin', 'Petrolimex', 'admin123', 'admin', 0)
ON CONFLICT (phone, country) DO NOTHING;
