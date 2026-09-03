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
    <div className="h-[100dvh] bg-[#022870] flex flex-col font-sans relative overflow-hidden touch-none">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>
      <div className="w-full relative z-10 shadow-sm overflow-hidden flex-shrink-0">
        <img referrerPolicy="no-referrer" 
          src="https://i.imgur.com/16PYs35.png" 
          alt="ElevFinAi"
          className="w-full h-auto object-contain"
        />
      </div>
                              
      <div className="px-6 flex-1 flex flex-col justify-start -mt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto relative z-10"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Créer un compte</h1>
            <p className="text-blue-200/80 text-sm font-medium">Veuillez créer votre compte pour commencer.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
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
              <label className="text-xs font-bold text-blue-200/60 uppercase tracking-widest ml-1">Téléphone</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-brand-400 font-bold text-base">+225</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                  maxLength={10}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-16 pr-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-semibold placeholder:text-white/40 text-base"
                  placeholder="0102030405"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-200/60 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-semibold placeholder:text-white/40 text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-200/60 uppercase tracking-widest ml-1">Code d'invitation (Optionnel)</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-semibold placeholder:text-white/40 text-base"
                placeholder="EX: ABCDEF"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 rounded-2xl mt-2 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? 'Création...' : (
                <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
          
          <p className="text-center text-blue-200/60 text-sm mt-4 font-medium">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
