import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { COUNTRIES, CountryName, COUNTRY_NAMES } from '../constants';
import { Eye, EyeOff } from 'lucide-react';

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
      return setError(`Le numéro doit contenir exactement ${countryInfo.length} chiffres pour le pays ${formData.country}`);
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    setLoading(true);
    const cleanPhone = formData.phone.replace(/\s/g, ''); // Clean spaces

    try {
      // Check if phone exists gracefully
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('country', formData.country)
        .maybeSingle();

      if (existError) {
        console.warn("DB Check Warning:", existError);
      }

      if (existingUser) {
        setError('Ce numéro est déjà utilisé dans ce pays');
        setLoading(false);
        return;
      }

      // Generate a simple referral code based on pseudo
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
            password_hash: formData.password, // In a real app, hash this!
            referral_code: finalCode,
            referred_by: formData.referralCode ? formData.referralCode.trim().toUpperCase() : null,
            balance: 0 // No signup bonus
          }
        ])
        .select()
        .single();

      if (insertError || !data) {
        console.error("Insert error:", insertError);
        
        if (insertError?.message?.includes('Could not find the table') || insertError?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }

        // Specifically catch unique constraint errors safely
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
      console.error(err);
      setError(`Erreur inattendue: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = COUNTRIES[formData.country];

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden text-zinc-50 bg-transparent">
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center min-h-screen py-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="https://i.imgur.com/qRUc5aF.png" alt="Fusion Money" className="h-8 w-8 rounded-xl object-cover shadow-sm bg-zinc-900 border border-zinc-800 p-0.5" referrerPolicy="no-referrer" />
            <h1 className="text-2xl grotesk font-black tracking-tight text-zinc-50">Inscription</h1>
          </div>
          <p className="text-zinc-400 font-medium text-xs">Créez votre profil collaborateur.</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <form onSubmit={handleRegister} className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Pseudo</label>
            <input
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide"
              placeholder="Ex: Pablito"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all w-full">
              <div className="relative flex items-center bg-transparent shrink-0">
                <select
                  name="country"
                  value={formData.country}
                  onChange={(e) => {
                     setFormData({ ...formData, country: e.target.value as CountryName, phone: '' });
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                >
                  {COUNTRY_NAMES.map(c => (
                    <option key={c} value={c}>{c} ({COUNTRIES[c].code})</option>
                  ))}
                </select>
                <div className="pointer-events-none flex items-center gap-1 pl-3 pr-2 py-3 text-zinc-400 font-bold">
                  <span>{selectedCountry.code}</span>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' className="w-4 h-4"><path stroke='#6b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/></svg>
                </div>
              </div>
              <div className="w-px bg-zinc-700 my-2"></div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= selectedCountry.length) {
                    setFormData({ ...formData, phone: val });
                  }
                }}
                className="flex-1 bg-transparent border-none px-3 py-3 text-zinc-50 focus:outline-none placeholder:text-zinc-500 font-medium tracking-wide w-full"
                placeholder={selectedCountry.placeholder}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
  
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Confirmer</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                   {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Code parrain</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              readOnly={!!(searchParams.get('ref') && searchParams.get('ref') !== 'undefined')}
              placeholder="Laissez vide si vous n'en avez pas"
              className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide ${searchParams.get('ref') && searchParams.get('ref') !== 'undefined' ? 'opacity-75 cursor-not-allowed' : ''}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white hover:bg-red-500 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-8">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-red-700 hover:text-red-800 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
