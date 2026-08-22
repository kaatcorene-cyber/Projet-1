import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { COUNTRIES, CountryName, COUNTRY_NAMES } from '../constants';
import { Droplet, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryName>("Côte d'Ivoire");
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('country', country)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        console.error("Login error:", error);
        
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }

        setError(error?.message && error.code !== 'PGRST116' 
          ? `Erreur technique Base de données: ${error.message}` 
          : 'Numéro ou mot de passe incorrect.');
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

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden text-zinc-50 bg-transparent">
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center min-h-screen py-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="https://i.imgur.com/qRUc5aF.png" alt="Fuel•Max" className="h-8 w-8 rounded-xl object-cover shadow-sm bg-zinc-900 border border-zinc-800 p-0.5" referrerPolicy="no-referrer" />
            <h1 className="text-2xl grotesk font-black tracking-tight text-zinc-50">Connexion</h1>
          </div>
          <p className="text-zinc-400 font-medium text-xs">Identifiez-vous sur l'espace collaborateur.</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <form onSubmit={handleLogin} className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all w-full">
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
                  <span>{COUNTRIES[country].code}</span>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' className="w-4 h-4"><path stroke='#6b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/></svg>
                </div>
              </div>
              <div className="w-px bg-zinc-700 my-2"></div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= COUNTRIES[country].length) {
                    setPhone(val);
                  }
                }}
                className="flex-1 bg-transparent border-none px-3 py-3 text-zinc-50 focus:outline-none placeholder:text-zinc-500 font-medium tracking-wide w-full"
                placeholder={COUNTRIES[country].placeholder}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
    </div>
  );
}
