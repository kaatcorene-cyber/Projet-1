import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppLogo } from '../components/AppLogo';
import { Loader2, ArrowRight, ShieldCheck, Lock, Phone } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

export function Login() {
  const [selectedCountryCode, setSelectedCountryCode] = useState('CI');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    setPhone(cleaned);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 8) {
      setError('Veuillez renseigner un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+') ? phone : `${currentCountry.dialCode}${phone}`;
      await login(fullPhone, password);
      navigate('/profile');
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
          Réseau Agro-Logistique & Transport AgriTrans
        </p>
      </div>

      {/* Main Form - Direct on the page (no card encapsulation) */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-bold text-center animate-in fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Numéro Mobile Money
            </label>
            <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-600 transition-all min-h-[50px]">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-slate-100 text-slate-900 font-bold text-sm px-3 border-r border-slate-200 outline-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.dialCode}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={12}
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3.5 py-3 text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-bold tracking-wide text-base"
                placeholder="Ex: 0701020304"
                required
              />
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
              <span>Numéro mobile sans l'indicatif</span>
              <span className={`font-mono font-bold ${phone.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {phone.length} chiffres
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Mot de passe
            </label>
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-600 transition-all min-h-[50px]">
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-md shadow-emerald-600/25 active:scale-98 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion sécurisée en cours...</span>
              </>
            ) : (
              <>
                <span>Accéder à mon compte</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Nouveau sur la plateforme ?{' '}
            <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-black tracking-wide underline underline-offset-2">
              Créer un compte
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Serveur sécurisé crypté SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
