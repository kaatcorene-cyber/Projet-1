import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Droplet } from 'lucide-react';

export function Login() {
  const [phone, setPhone] = useState('');
  const [country] = useState("Cote d'Ivoire");
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
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden text-white">
      {/* Container matches animated dark theme */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 relative">
          <div className="absolute inset-0 bg-emerald-500 blur-xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-[60px] object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenue</h1>
        <p className="text-white/80 text-sm">Connectez-vous à votre compte</p>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold border-r border-white/20 pr-3">+225</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/^\+225/, ''))}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-16 pr-4 py-3 text-white focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all placeholder:text-white/40 font-medium tracking-wide"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70 ml-1 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all placeholder:text-white/40 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-emerald-900 hover:bg-gray-100 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-white hover:text-emerald-300 font-bold tracking-wide transition-colors">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
