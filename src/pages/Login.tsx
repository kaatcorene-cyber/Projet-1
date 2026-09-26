import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppLogo } from '../components/AppLogo';
import { Loader2, ArrowRight, ShieldCheck, Lock, Phone, CheckCircle2 } from 'lucide-react';
import { COUNTRIES, CountryConfig, getPhoneRequirementLabel, validatePhoneForCountry } from '../data/countries';

export function Login() {
  const [selectedCountryCode, setSelectedCountryCode] = useState('CI');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const currentCountry: CountryConfig = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode);
    const newCountry = COUNTRIES.find(c => c.code === newCountryCode) || COUNTRIES[0];
    if (phone.length > newCountry.maxLength) {
      setPhone(phone.slice(0, newCountry.maxLength));
    }
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    
    // Auto-détection si l'utilisateur colle un numéro complet avec indicatif pays
    for (const c of COUNTRIES) {
      const dialDigits = c.dialCode.replace('+', '');
      if (val.startsWith(dialDigits) && val.length > dialDigits.length) {
        setSelectedCountryCode(c.code);
        val = val.slice(dialDigits.length);
        const targetCountry = c;
        const cleaned = val.slice(0, targetCountry.maxLength);
        setPhone(cleaned);
        setError('');
        return;
      }
    }

    const cleaned = val.slice(0, currentCountry.maxLength);
    setPhone(cleaned);
    setError('');
  };

  const isPhoneValid = phone.length >= currentCountry.minLength && phone.length <= currentCountry.maxLength;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validatePhoneForCountry(phone, currentCountry);
    if (!validation.valid) {
      setError(validation.message || 'Veuillez renseigner un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    try {
      // login() gère automatiquement tous les formats (indicatif sélectionné, avec/sans indicatif, etc.)
      const loggedUser = await login(phone, password, currentCountry.dialCode);
      if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Identifiants invalides. Vérifiez votre numéro et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto bg-slate-50 text-slate-900 font-sans select-none">
      
      {/* Header / Brand Logo - Direct on page */}
      <div className="text-center mb-8 flex flex-col items-center w-full">
        <div className="mb-4">
          <AppLogo imgClassName="h-11 w-auto object-contain max-h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Connexion à votre compte
        </h1>
        <p className="text-slate-600 font-medium text-xs sm:text-sm mt-1.5">
          Réseau Officiel Stations-Service & Énergie ORLEN
        </p>
      </div>

      {/* Main Form - Direct on the page (no card encapsulation) */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-bold text-center animate-in fade-in space-y-2">
              <p>{error}</p>
              {error.includes('introuvable') && (
                <div className="pt-1">
                  <Link
                    to={`/register?phone=${encodeURIComponent(phone)}`}
                    className="inline-flex items-center gap-1.5 text-xs text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg font-black transition-all shadow-sm"
                  >
                    <span>Créer un compte avec ce numéro</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                Numéro Mobile Money
              </label>
            </div>

            <div className={`flex bg-white border-2 rounded-xl overflow-hidden transition-all min-h-[50px] ${
              isPhoneValid ? 'border-red-500' : 'border-slate-200 focus-within:border-red-600'
            }`}>
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-slate-100 text-slate-900 font-bold text-sm px-3 border-r border-slate-200 outline-none cursor-pointer"
                title="Sélectionner l'indicatif"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={currentCountry.maxLength}
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3.5 py-3 text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-bold tracking-wide text-base"
                placeholder={`Ex: ${currentCountry.placeholder}`}
                required
              />
              {isPhoneValid && (
                <div className="flex items-center pr-3 text-red-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
              <span>Format attendu : <strong className="text-slate-700 font-bold">{getPhoneRequirementLabel(currentCountry)}</strong></span>
              <span className={`font-mono font-bold ${isPhoneValid ? 'text-red-600' : 'text-slate-500'}`}>
                {phone.length}/{currentCountry.phoneLength} chiffres
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              Mot de passe
            </label>
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-red-600 transition-all min-h-[50px]">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-bold tracking-wide text-base"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-md shadow-red-600/25 active:scale-98 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-red-700 hover:text-red-800 font-black tracking-wide underline underline-offset-2">
              Créer un compte
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Connexion cryptée et sécurisée</span>
          </div>
        </div>
      </div>
    </div>
  );
}
