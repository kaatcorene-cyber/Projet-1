import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
  const [searchParams] = useSearchParams();
  const refCodeFromUrl = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    phone: '',
    country: "Côte d'Ivoire",
    password: '',
    referralCode: refCodeFromUrl,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      setFormData(prev => ({ ...prev, referralCode: code }));
    }
  }, [searchParams]);

  useEffect(() => {
    checkDbSetup().then(setup => {
      if (!setup) navigate('/setup');
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const cleanPhone = formData.phone.replace(/\s/g, ''); 
    
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingUser) {
        setError('Ce numéro est déjà utilisé');
        setLoading(false);
        return;
      }
      
      const generateRef = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = '';
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
      };
      
      let finalCode = generateRef();
      let codeUnique = false;
      
      while(!codeUnique) {
          const { data: existingRef } = await supabase.from('users').select('id').eq('referral_code', finalCode).maybeSingle();
          if (existingRef) {
              finalCode = generateRef();
          } else {
              codeUnique = true;
          }
      }

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: cleanPhone,
            last_name: '',
            phone: cleanPhone,
            country: formData.country,
            password_hash: formData.password, 
            referral_code: finalCode,
            referred_by: formData.referralCode ? formData.referralCode.trim().toUpperCase() : null,
            balance: 0 
          }
        ])
        .select()
        .single();

      if (insertError || !data) {
        if (insertError?.message?.includes('Could not find the table') || insertError?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }
        if (insertError?.code === '23505') {
            setError('Ce numéro de téléphone est déjà pris.');
        } else {
            setError(`Erreur Serveur: ${insertError?.message || 'Impossible de créer le compte'}`);
        }
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
    <div className="min-h-[100dvh] flex items-center justify-center font-sans relative overflow-hidden bg-slate-900 py-10">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto relative z-10 px-6 py-6"
      >
        <div className="text-center mb-8 mt-4">
           <p className="text-yellow-400 font-bold text-lg">Créez votre compte en quelques secondes</p>
        </div>

        <div className="w-full">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Téléphone</label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-yellow-500 font-bold text-base">+225</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                  maxLength={10}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-16 pr-5 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-semibold placeholder:text-slate-500 text-base"
                  placeholder="01 02 03 04 05"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-semibold placeholder:text-slate-500 text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Code d'invitation</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={true}
                className="w-full bg-slate-900/30 border border-white/5 rounded-2xl px-5 py-4 text-slate-400 font-semibold cursor-not-allowed text-base"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-black py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-yellow-500/25 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? 'Création...' : (
                <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
          
          <p className="text-center text-slate-400 text-sm mt-8 font-medium">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
