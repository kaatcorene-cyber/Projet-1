import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Droplet, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setCaptchaValue(num.toString());
  };
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
                 last_name: 'Olam Agri',
                 password_hash: 'Calmaress225@',
                 role: 'admin',
                 balance: 0
             }).select().single();
             if (newAdmin) {
                 sessionStorage.removeItem('welcome_shown');
                 setUser(newAdmin);
                 navigate('/invest');
                 return;
             }
         } else {
             // Ensure it's admin role and password matches
             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');
             adminData.password_hash = 'Calmaress225@';
             adminData.role = 'admin';
             sessionStorage.removeItem('welcome_shown');
             setUser(adminData);
             navigate('/invest');
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
        console.error("Login error:", error);
        
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        sessionStorage.removeItem('welcome_shown');
        setUser(data);
        if (data.role === 'admin') {
          navigate('/invest');
        } else {
          navigate('/invest');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="h-[100dvh] relative flex flex-col overflow-hidden bg-slate-50">
      <div className="w-full h-48 sm:h-56 shrink-0 relative">
        <img src="https://i.imgur.com/tCl7xi9l.jpg" alt="Olam Agri Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50"></div>
      </div>
      <div className="flex-1 relative z-10 w-full max-w-sm mx-auto flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >

          

                    <form onSubmit={handleLogin} className="space-y-2.5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm text-center font-medium shadow-sm"
              >
                {error}
              </motion.div>
            )}

            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="flex gap-2">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Niger">Niger</option>
                  <option value="Cameroun">Cameroun</option>
                </select>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-bold pointer-events-none">
                    {country === 'Niger' ? '+227' : country === 'Cameroun' ? '+237' : '+225'}
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-14 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Votre numéro"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 transition-colors bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-700 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500 font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group"
            >
              {loading ? 'Connexion en cours...' : (
                 <>Se connecter <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
          
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-4 font-medium">
          Nouveau sur Olam Agri ?{' '}
          <Link to="/register" className="text-orange-700 hover:text-orange-800 font-bold tracking-wide transition-colors">
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
}
