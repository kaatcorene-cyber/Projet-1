import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppLogo } from '../components/AppLogo';
import { Loader2, ArrowRight, ShieldCheck, Lock, Gift, Phone } from 'lucide-react';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuthStore();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: cleaned }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phone.length < 8) {
      setError('Veuillez renseigner un numéro de téléphone valide');
      return;
    }

    if (formData.password.length < 4) {
      setError('Le mot de passe doit comporter au moins 4 caractères');
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.phone,
        formData.password,
        '',
        '',
        formData.referralCode
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
          Rejoignez le réseau agro-logistique & transport AgriTrans
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
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Numéro Mobile Money
            </label>
            <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-600 transition-all min-h-[50px]">
              <span className="flex items-center px-4 bg-slate-100 text-slate-800 font-black text-sm border-r border-slate-200 select-none">
                +225
              </span>
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-bold tracking-wide text-base"
                placeholder="0701020304"
                required
              />
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
              <span>Numéro national (10 chiffres)</span>
              <span className={`font-mono font-bold ${formData.phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {formData.phone.length}/10
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
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                Code Parrain
              </span>
              <span className="text-slate-500 lowercase font-medium text-[11px]">facultatif</span>
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[50px]">
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={!!formData.referralCode}
                onChange={handleChange}
                placeholder="Aucun parrain"
                className="w-full text-emerald-800 focus:outline-none bg-transparent placeholder:text-slate-400 font-mono font-bold uppercase tracking-wider text-sm"
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
            Déjà inscrit sur AgriTrans ?{' '}
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-black tracking-wide underline underline-offset-2">
              Se connecter
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Données confidentielles et sécurisées</span>
          </div>
        </div>
      </div>
    </div>
  );
}
