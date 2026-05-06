import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Sun } from 'lucide-react';

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

    const cleanPhone = phone.replace(/\s/g, '');

    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_hash', password);
        
      if (cleanPhone !== 'mission01') {
        // Automatically default country filter since it's hidden from UI
        query = query.eq('country', "Cote d'Ivoire");
      }

      const { data, error: queryError } = await query.single();

      if (queryError || !data) {
        console.error("Login error:", queryError);
        if (queryError?.message?.includes('Could not find the table') || queryError?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }

        setError(queryError?.message && queryError.code !== 'PGRST116' 
          ? `Erreur technique Base de données: ${queryError.message}` 
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

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-x-hidden bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        <div className="mb-6 flex items-center justify-center gap-1.5">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3 text-white">Connexion au Réseau</h1>
        <p className="text-gray-400 font-medium text-sm">Contrôlez vos investissements énergétiques</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative z-10">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black border-r border-white/10 pr-3">
                +225
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/^\+225/, ''))}
                className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl pl-[4.5rem] pr-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all placeholder:text-gray-600 font-medium tracking-wide"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all placeholder:text-gray-600 font-medium tracking-wide"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl mt-8 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authentification...' : 'Ouvrir la session'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8 font-medium">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-amber-500 hover:text-amber-400 font-bold tracking-wide transition-colors">
            Rejoindre Soleil-Power
          </Link>
        </p>
      </div>
    </div>
  );
}
