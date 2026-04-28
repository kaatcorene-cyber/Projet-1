import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Droplet } from 'lucide-react';

export function Login() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState("Cote d'Ivoire");
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
    setLoading(true);

    const cleanPhone = phone.replace(/\s/g, ''); // Fix spaces in phone numbers

    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_hash', password);
        
      // If it's not the default admin phone, strictly enforce Côte d'Ivoire.
      // This allows the admin account to log in gracefully.
      if (cleanPhone !== 'mission01') {
        query = query.eq('country', country);
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
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden text-gray-900">
      {/* Container matches animated dark theme */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 relative">
          <div className="absolute inset-0 bg-red-100 blur-3xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/awFyFRj.png" alt="QUALCOMM" className="h-[60px] object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenue</h1>
        <p className="text-gray-500 text-sm">Connectez-vous à votre compte</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium appearance-none"
              required
            >
              <option value="Cote d'Ivoire">Côte d'Ivoire</option>
              <option value="Togo">Togo</option>
              <option value="Burkina Faso">Burkina Faso</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3">
                {country === "Cote d'Ivoire" ? '+225' : country === 'Togo' ? '+228' : '+226'}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/^\+225/, ''))}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-400 font-medium tracking-wide"
                placeholder="0123456789"
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
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-400 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-red-950 hover:bg-gray-100 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-red-700 hover:text-red-800 font-bold tracking-wide transition-colors">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
