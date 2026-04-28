import { useState, useEffect } from 'react';
import { checkDbSetup } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Database, Copy, CheckCircle } from 'lucide-react';

export function Setup() {
  const [isChecking, setIsChecking] = useState(true);
  const [isSetup, setIsSetup] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkDbSetup().then(setup => {
      setIsSetup(setup);
      setIsChecking(false);
      if (setup) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const schema = `-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  country TEXT DEFAULT "Cote d'Ivoire",
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
    ALTER TABLE users ADD COLUMN country TEXT DEFAULT "Cote d'Ivoire";
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
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
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
VALUES ('0000000000', "Cote d'Ivoire", 'Admin', 'QUALCOMM', 'admin123', 'admin', 0)
ON CONFLICT (phone, country) DO NOTHING;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Vérification de la base de données...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <Database className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-center">Configuration Requise</h1>
      <p className="text-gray-500 text-center mb-8">
        La base de données n'est pas encore configurée. Veuillez exécuter le script SQL suivant dans votre éditeur SQL Supabase.
      </p>

      <div className="w-full relative group">
        <div className="absolute right-2 top-2">
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-red-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <pre className="bg-white p-4 rounded-xl overflow-x-auto text-xs text-gray-600 border border-gray-200 h-64">
          <code>{schema}</code>
        </pre>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="mt-8 w-full py-3 bg-red-500 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
      >
        J'ai exécuté le script
      </button>
    </div>
  );
}
