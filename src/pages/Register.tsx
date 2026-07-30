import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { COUNTRIES, CountryName, COUNTRY_NAMES } from '../constants';
import { Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    country: "Bénin" as CountryName,
    password: '',
    referralCode: (searchParams.get('ref') && searchParams.get('ref') !== 'undefined') ? searchParams.get('ref') : ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');

  // Generate a random 4-digit captcha on mount
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
        const chars = 'abcdefghijklmnopqrstuvwxyz';
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
        navigate('/invest');
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
        <img src="https://i.imgur.com/I2qt7oHl.jpg" alt="Olam Agri Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50"></div>
      </div>
      <div className="flex-1 relative z-10 w-full max-w-sm mx-auto flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <form onSubmit={handleRegister} className="space-y-3">
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
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Burkina">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                </select>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-bold pointer-events-none">
                    {formData.country === 'Bénin' ? '+229' : formData.country === 'Togo' ? '+228' : formData.country === 'Burkina' ? '+226' : '+227'}
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">
                <span>Code d'invitation</span>
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={true}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-semibold cursor-not-allowed placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Rempli automatiquement via le lien"
              />
            </div>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-700 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500 font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-orange-600/30 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group"
            >
              {loading ? 'Création en cours...' : (
                 <>Créer mon compte <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
          
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-4 font-medium">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-orange-700 hover:text-orange-800 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}
