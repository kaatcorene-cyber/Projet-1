import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { AppLogo } from '../components/AppLogo';

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
        query = query.eq('country', country);
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
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-center px-6 max-w-md mx-auto relative bg-gray-50 text-gray-900 font-sans overscroll-none select-none">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="text-center mb-5 flex flex-col items-center relative z-10 shrink-0">
        <div className="mb-3">
           <AppLogo imgClassName="h-9 w-auto object-contain max-h-11" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-1 text-gray-900">Connexion</h1>
        <p className="text-gray-500 font-medium text-xs">Accédez à votre espace agricole Cargill</p>
      </div>

      <div className="w-full relative z-10">
        <form onSubmit={handleLogin} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Téléphone</label>
            <div className="flex bg-white border border-black/10 shadow-sm rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <span className="flex items-center px-3.5 bg-gray-50 text-gray-700 font-bold text-xs border-r border-black/10">
                +225
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-gray-900 focus:outline-none bg-transparent placeholder:text-gray-400 font-medium tracking-wide text-sm"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-400 font-medium tracking-wide text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl mt-5 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Authentification...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-5 font-medium">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-500 font-bold tracking-wide transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
