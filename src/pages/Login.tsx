import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Droplet } from 'lucide-react';
import { COUNTRIES, CountryName, COUNTRY_NAMES } from '../constants';

export function Login() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryName>("Côte d'Ivoire");
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkDbSetup().then(setup => {
      if (!setup) navigate('/setup');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // allow bypass length check if phone is purely mission01
    const cleanPhone = phone.replace(/\s/g, ''); // Fix spaces in phone numbers
    if (cleanPhone !== 'mission01') {
      const countryInfo = COUNTRIES[country];
      if (cleanPhone.length !== countryInfo.length) {
        return setError(`Le numéro doit contenir exactement ${countryInfo.length} chiffres pour le pays ${country}`);
      }
    }

    setLoading(true);

    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_hash', password);
        
      // If it's not the default admin phone, strictly enforce Côte d'Ivoire.
      // This allows the admin account to log in gracefully.
      if (cleanPhone !== 'mission01') {
        // Look up by country but accept exact match or fallback for backwards compatibility or dev data
        // For existing users with "Cote d'Ivoire", "Côte d'Ivoire" match might fail if we change the constant but let's query the specific country.
        // The user asked to ensure country matches exactly what they select.
        query = query.in('country', [country, country.replace('ô', 'o')]);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.error("Login error:", error);
        
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }

        setError(error?.message && error.code !== 'PGRST116' 
          ? `Erreur technique Base de données: ${error.message}` 
          : 'Numéro, pays ou mot de passe incorrect.');
      } else {
        sessionStorage.removeItem('welcome_shown');
        setUser(data);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(`Erreur inattendue: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = COUNTRIES[country];

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden text-zinc-50">
      {/* Container matches animated dark theme */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-zinc-900 border-zinc-800/80 shadow-black/20 p-4 rounded-3xl shadow-xl mb-6 relative border border-zinc-800">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="h-[60px] rounded-full object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl grotesk font-black tracking-tight mb-2 text-zinc-50">Connexion</h1>
        <p className="text-zinc-400 font-medium text-sm">Identifiez-vous chez collaborateur</p>
      </div>

      <div className="bg-zinc-900 border-zinc-800/80 shadow-black/20 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="flex bg-zinc-900 border-zinc-800/80 shadow-black/20 border border-zinc-800 shadow-sm rounded-xl overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all w-full">
              <div className="relative flex items-center bg-transparent shrink-0">
                <select
                  value={country}
                  onChange={(e) => {
                     setCountry(e.target.value as CountryName);
                     setPhone('');
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                >
                  {COUNTRY_NAMES.map(c => (
                    <option key={c} value={c}>{c} ({COUNTRIES[c].code})</option>
                  ))}
                </select>
                <div className="pointer-events-none flex items-center gap-1 pl-3 pr-2 py-3 text-zinc-400 font-bold">
                  <span>{selectedCountry.code}</span>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' className="w-4 h-4"><path stroke='#6b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/></svg>
                </div>
              </div>
              <div className="w-px bg-zinc-700 my-2"></div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                   const raw = e.target.value;
                   if (raw === 'mission01') {
                     setPhone(raw);
                   } else {
                     const val = raw.replace(/\D/g, '');
                     if (val.length <= selectedCountry.length) {
                       setPhone(val);
                     }
                   }
                }}
                className="flex-1 bg-transparent border-none px-3 py-3 text-zinc-50 focus:outline-none placeholder:text-zinc-500 font-medium tracking-wide w-full"
                placeholder={selectedCountry.placeholder}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border-zinc-800/80 shadow-black/20 border border-zinc-800 shadow-sm rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:bg-zinc-900 border-zinc-800/80 shadow-black/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-zinc-500 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white hover:bg-red-500 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-red-700 hover:text-red-800 font-bold tracking-wide transition-colors">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
