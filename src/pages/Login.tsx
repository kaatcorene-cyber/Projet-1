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
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden text-gray-900">
      {/* Container matches animated dark theme */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 relative">
          <div className="absolute inset-0 bg-purple-100 blur-3xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/bjYgoI6.png" alt="Adela Mining" className="h-[60px] rounded-full object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 🌟</h1>
        <p className="text-purple-900 font-medium text-sm">𝑪𝒐𝒏𝒏𝒆𝒄𝒕𝒆𝒛-𝒗𝒐𝒖𝒔 à 𝒗𝒐𝒕𝒓𝒆 𝒄𝒐𝒎𝒑𝒕𝒆.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="flex bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all w-full">
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
                <div className="pointer-events-none flex items-center gap-1 pl-3 pr-2 py-3 text-gray-500 font-bold">
                  <span>{selectedCountry.code}</span>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' className="w-4 h-4"><path stroke='#6b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/></svg>
                </div>
              </div>
              <div className="w-px bg-gray-200 my-2"></div>
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
                className="flex-1 bg-transparent border-none px-3 py-3 text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium tracking-wide w-full"
                placeholder={selectedCountry.placeholder}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-400 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-950 hover:bg-gray-100 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-purple-700 hover:text-purple-800 font-bold tracking-wide transition-colors">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
