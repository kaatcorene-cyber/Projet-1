import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppLogo } from '../components/AppLogo';
import { Loader2, ArrowRight, ShieldCheck, Lock, Gift, Phone, CheckCircle2, X } from 'lucide-react';
import { COUNTRIES, CountryConfig, getPhoneRequirementLabel, validatePhoneForCountry } from '../data/countries';

export function Register() {
  const [searchParams] = useSearchParams();
  const [selectedCountryCode, setSelectedCountryCode] = useState('CI');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const currentCountry: CountryConfig = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('code');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref.trim().toUpperCase() }));
    }
  }, [searchParams]);

  // When country changes, adjust phone if it exceeds the new country's max length
  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode);
    const newCountry = COUNTRIES.find(c => c.code === newCountryCode) || COUNTRIES[0];
    if (formData.phone.length > newCountry.maxLength) {
      setFormData(prev => ({ ...prev, phone: prev.phone.slice(0, newCountry.maxLength) }));
    }
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setFormData(prev => ({ ...prev, phone: cleaned }));
        setError('');
        return;
      }
    }

    const cleaned = val.slice(0, currentCountry.maxLength);
    setFormData(prev => ({ ...prev, phone: cleaned }));
    setError('');
  };

  const isPhoneValid = formData.phone.length >= currentCountry.minLength && formData.phone.length <= currentCountry.maxLength;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validatePhoneForCountry(formData.phone, currentCountry);
    if (!validation.valid) {
      setError(validation.message || 'Numéro de téléphone invalide');
      return;
    }

    if (formData.password.length < 4) {
      setError('Le mot de passe doit comporter au moins 4 caractères');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${currentCountry.dialCode}${formData.phone}`;
      await register(
        fullPhone,
        formData.password,
        '',
        '',
        formData.referralCode,
        currentCountry.name,
        currentCountry.dialCode
      );
      navigate('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = err?.message || "Une erreur est survenue lors de l'inscription.";
      if (msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('unique constraint') || msg.includes('users_phone_key')) {
        msg = 'Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.';
      }
      setError(msg);
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
          Créer un Compte
        </h1>
        <p className="text-slate-600 font-medium text-xs sm:text-sm mt-1.5">
          Rejoignez le réseau officiel de stations-service ORLEN
        </p>
      </div>

      {/* Main Form - Direct on the page */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-bold text-center animate-in fade-in">
              {error}
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
                name="phone"
                maxLength={currentCountry.maxLength}
                value={formData.phone}
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
                {formData.phone.length}/{currentCountry.phoneLength} chiffres
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-bold tracking-wide text-base"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-red-600" />
                Code Parrain
              </span>
              <span className="text-slate-500 lowercase font-medium text-[11px]">facultatif</span>
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-red-600 focus-within:bg-white rounded-xl px-4 py-2.5 min-h-[50px] transition-all">
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                placeholder="Ex: AGRIADMIN ou code ami"
                className="w-full text-red-800 focus:outline-none bg-transparent placeholder:text-slate-400 font-mono font-bold uppercase tracking-wider text-sm pr-16"
              />
              {formData.referralCode ? (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-red-600" />
                    Actif
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, referralCode: '' }))}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer transition-colors"
                    title="Effacer le code parrain"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            {formData.referralCode && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 pl-1">
                ✓ Vous serez affilié à votre parrain pour bénéficier des bonus d'équipe.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-md shadow-red-600/25 active:scale-98 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création de votre compte...</span>
              </>
            ) : (
              <>
                <span>Valider mon inscription</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Déjà inscrit sur ORLEN ?{' '}
            <Link to="/login" className="text-red-700 hover:text-red-800 font-black tracking-wide underline underline-offset-2">
              Se connecter
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Données confidentielles et sécurisées</span>
          </div>
        </div>
      </div>
    </div>
  );
}
