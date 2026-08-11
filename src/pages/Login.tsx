import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [phone, setPhone] = useState('');
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
      
      // Auto-create/force admin if it matches
      if (cleanPhone === '0704752133' && password === 'Calmaress225@') {
         const { data: adminData } = await supabase.from('users').select('*').eq('phone', '0704752133').single();
         if (!adminData) {
             const { data: newAdmin } = await supabase.from('users').insert({
                 phone: '0704752133',
                 country: "Côte d'Ivoire",
                 first_name: 'Admin',
                 last_name: 'ElevFinAi',
                 password_hash: 'Calmaress225@',
                 role: 'admin',
                 balance: 0
             }).select().single();
             if (newAdmin) {
                 sessionStorage.removeItem('welcome_shown');
                 setUser(newAdmin);
                 navigate('/dashboard');
                 return;
             }
         } else {
             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');
             adminData.password_hash = 'Calmaress225@';
             adminData.role = 'admin';
             sessionStorage.removeItem('welcome_shown');
             setUser(adminData);
             navigate('/dashboard');
             return;
         }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_hash', password.trim())
        .single();

      if (error || !data) {
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        sessionStorage.removeItem('welcome_shown');
        setUser(data);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col font-sans relative overflow-hidden touch-none">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>

      
      <div className="w-full relative z-10 shadow-sm overflow-hidden flex-shrink-0">
        <img 
          src="https://i.imgur.com/X88pNGU.jpeg" 
          alt="ElevFinAi"
          className="w-full h-auto object-contain"
        />
      </div>
      
      <div className="px-6 flex-1 flex flex-col justify-center pb-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        
                        

                
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-emerald-400 font-bold text-base">+225</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                maxLength={10}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl pl-16 pr-4 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-600 text-base"
                placeholder="0102030405"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl pl-4 pr-12 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-600 text-base"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-2xl mt-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Connexion...' : (
              <>Se connecter <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-sm mt-4 font-medium">
          Nouveau sur ElevFinAi ?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
            Créer un compte
          </Link>
        </p>
      </motion.div>
      </div>
    </div>
  );
}
