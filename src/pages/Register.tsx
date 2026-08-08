import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
  const [formData, setFormData] = useState({
    phone: '',
    country: "Côte d'Ivoire",
    password: '',
    referralCode: '36480',
  });
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Créer un compte,</h1>
          <p className="text-slate-500 mt-2 font-medium">Rejoignez ElevFinAi aujourd'hui.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-emerald-400 font-bold text-sm">+225</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val });
                }}
                maxLength={10}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl pl-16 pr-4 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-600 text-sm"
                placeholder="0102030405"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl pl-4 pr-12 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-600 text-sm"
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

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Code d'invitation</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              readOnly={true}
              className="w-full bg-white/30 border border-slate-200/50 rounded-2xl px-4 py-4 text-slate-500 font-semibold cursor-not-allowed text-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Création...' : (
              <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
