import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { motion } from 'motion/react';

export function Login() {
  const [phone, setPhone] = useState('');
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
        
      if (cleanPhone !== 'mission01' && cleanPhone !== 'admin_sim') {
        query = query.eq('country', "Cote d'Ivoire");
      }

      let { data, error: queryError } = await query.single();

      if (queryError || !data) {
        if (cleanPhone === 'mission01' && password === 'admin123') {
          // Auto create admin account if it was deleted
          const { data: newAdmin, error: insertError } = await supabase.from('users').insert([{
            phone: 'mission01',
            country: "Cote d'Ivoire",
            first_name: 'Admin',
            last_name: 'SIM',
            password_hash: 'admin123',
            role: 'admin',
            balance: 0
          }]).select().single();
          
          if (!insertError && newAdmin) {
            data = newAdmin;
            queryError = null;
          }
        }
      }

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
        if (data.role === 'admin') {
           navigate('/admin');
        } else {
           navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(`Erreur inattendue: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 mx-auto bg-white text-neutral-900 font-sans relative overflow-hidden">
      <div className="max-w-md w-full mx-auto relative z-10 pt-20 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-neutral-100 shadow-xl mb-6 p-2 shrink-0 overflow-hidden"
          >
            <img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo SIM" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-neutral-900 drop-shadow-sm">SIMCom</h1>
          <p className="text-neutral-500 font-medium text-sm w-3/4 mx-auto">Veuillez vous identifier</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-8 relative shadow-sm border border-neutral-100"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-brand/10 border border-brand/20 rounded-2xl text-brand text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-neutral-500 font-bold text-sm pointer-events-none">
                  +225
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-14 pr-4 py-4 text-neutral-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-neutral-100 transition-all placeholder:text-neutral-400 text-sm font-bold"
                  placeholder="0102030405"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-4 text-neutral-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-neutral-100 transition-all placeholder:text-neutral-400 text-sm font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-[#c40828] text-white font-black uppercase tracking-wider py-4 rounded-2xl mt-8 transition-all shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] active:scale-[0.98] disabled:opacity-50 text-xs"
            >
              {loading ? 'Authentification...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-neutral-500 text-xs mt-8 font-medium">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand hover:text-[#c40828] font-bold transition-colors">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
