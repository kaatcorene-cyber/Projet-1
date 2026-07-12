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
    pseudo: '',
    phone: '',
    country: "Côte d'Ivoire" as CountryName,
    password: '',
    confirmPassword: '',
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
    if (e.target.name === 'pseudo') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const countryInfo = COUNTRIES[formData.country];
    if (formData.phone.length !== countryInfo.length) {
      return setError(`Le numéro doit contenir exactement ${countryInfo.length} chiffres pour ${formData.country}`);
    }

    if (userCaptcha !== captchaValue) {
      setError('Code de vérification incorrect.');
      generateCaptcha();
      setUserCaptcha('');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    setLoading(true);
    const cleanPhone = formData.phone.replace(/\s/g, ''); 

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('country', formData.country)
        .maybeSingle();

      if (existingUser) {
        setError('Ce numéro est déjà utilisé dans ce pays');
        setLoading(false);
        return;
      }

      let myReferralCode = formData.pseudo.replace(/\s+/g, '').toUpperCase();
      let codeUnique = false;
      let finalCode = myReferralCode;
      
      while(!codeUnique) {
          const { data: existingRef } = await supabase.from('users').select('id').eq('referral_code', finalCode).maybeSingle();
          if (existingRef) {
              finalCode = myReferralCode + Math.floor(Math.random() * 1000);
          } else {
              codeUnique = true;
          }
      }

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: formData.pseudo,
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
    <div className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden bg-transparent py-10">
      
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="https://i.imgur.com/20bDoyM.png" alt="Limak" className="w-12 h-12 object-contain drop-shadow-md" referrerPolicy="no-referrer" />
              <h1 className="text-2xl grotesk font-black text-slate-900 tracking-tight">Inscription</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">Créez votre compte Limak</p>
          </div>

                    <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center font-medium shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Identifiant</label>
              <input
                type="text"
                name="pseudo"
                value={formData.pseudo}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Ex: Pablito"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[110px_1fr] gap-2">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Pays</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-2 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold text-sm appearance-none text-center"
                    required
                  >
                    {COUNTRY_NAMES.map(c => (
                      <option key={c} value={c}>{COUNTRIES[c].code}</option>
                    ))}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Votre numéro"
                    required
                  />
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">
                <span>Code d'invitation</span>
                <span className="text-slate-400 font-normal">(Optionnel)</span>
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Si vous avez été invité"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">
                <span>Vérification</span>
                
              </label>
              <div className="flex gap-2">
                <div 
                  className="w-24 shrink-0 flex items-center justify-center bg-slate-200 rounded-xl relative overflow-hidden select-none border-2 border-slate-300"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/>%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/>%3C/g%3E%3C/svg%3E")'
                  }}
                >
                  <span className="text-xl font-black text-slate-600 tracking-[0.15em] italic transform skew-x-[-15deg] opacity-70 blur-[1px]" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
                    {captchaValue}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                  {/* Additional line crossing out for obfuscation */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-400/50 transform -translate-y-1/2 rotate-[-5deg]"></div>
                </div>
                <input
                  type="text"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal text-center tracking-widest"
                  placeholder="Code"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-500 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group"
            >
              {loading ? 'Création en cours...' : (
                 <>Créer mon compte <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
          
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-700 hover:text-blue-800 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}
