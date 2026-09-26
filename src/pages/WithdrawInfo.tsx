import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowRight,
  Globe2
} from 'lucide-react';
import { COUNTRIES, CountryConfig, getCountryByCode } from '../data/countries';

export interface WithdrawalDetails {
  country: string;
  countryCode: string;
  dialCode: string;
  method: string;
  phone: string;
  fullName: string;
  savedAt: string;
}

export default function WithdrawInfo() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('CI');
  const [method, setMethod] = useState<string>('Wave');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCountry = getCountryByCode(selectedCountryCode);

  // When country changes, ensure selected method belongs to this country
  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = getCountryByCode(code);
    if (!country.methods.includes(method)) {
      setMethod(country.methods[0]);
    }
  };

  // Load existing details
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`agritrans_withdraw_info_${user.id}`) ||
                  localStorage.getItem(`translogis_withdraw_info_${user.id}`) ||
                  localStorage.getItem(`withdrawal_account_${user.id}`);
    if (saved) {
      try {
        const parsed: WithdrawalDetails = JSON.parse(saved);
        if (parsed.countryCode) {
          setSelectedCountryCode(parsed.countryCode);
        }
        if (parsed.method) setMethod(parsed.method);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.fullName) setFullName(parsed.fullName);
        return;
      } catch (e) {}
    }

    // Try fallback from user object
    if (user.phone) {
      // Check if phone matches dial code
      for (const c of COUNTRIES) {
        if (user.phone.startsWith(c.dialCode)) {
          setSelectedCountryCode(c.code);
          setMethod(c.methods[0]);
          setPhone(user.phone.replace(c.dialCode, ''));
          return;
        }
      }
      setPhone(user.phone.replace('+225', ''));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError("Veuillez vous connecter pour enregistrer vos coordonnées.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = fullName.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      setError("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    if (!cleanName || cleanName.length < 3) {
      setError("Veuillez renseigner les nom et prénom complets du titulaire.");
      return;
    }

    setSaving(true);
    try {
      const details: WithdrawalDetails = {
        country: currentCountry.name,
        countryCode: currentCountry.code,
        dialCode: currentCountry.dialCode,
        method,
        phone: cleanPhone,
        fullName: cleanName,
        savedAt: new Date().toISOString()
      };

      // 1. Save in localStorage (all legacy and active keys)
      const dataStr = JSON.stringify(details);
      localStorage.setItem(`agritrans_withdraw_info_${user.id}`, dataStr);
      localStorage.setItem(`translogis_withdraw_info_${user.id}`, dataStr);
      localStorage.setItem(`withdrawal_account_${user.id}`, dataStr);

      // 2. Also persist to Supabase in user address/metadata
      try {
        await supabase
          .from('users')
          .update({
            address: JSON.stringify(details),
            country: currentCountry.name
          })
          .eq('id', user.id);
      } catch (dbErr) {
        console.warn('Could not persist withdrawal info to users table:', dbErr);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 6000);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au compte</span>
        </button>
        <span className="text-xs font-black uppercase tracking-wider text-red-700">Coordonnées de Retrait</span>
      </header>

      <main className="max-w-lg mx-auto pt-4 px-3 sm:px-0 space-y-4">
        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
              <span>Coordonnées enregistrées avec succès !</span>
            </div>
            <p className="text-xs text-red-800 font-medium">
              Vos informations ({currentCountry.name} - {method}) ont été sauvegardées. Vous pouvez effectuer vos retraits en toute sécurité.
            </p>
            <Link
              to="/withdraw"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 transition-all shadow-sm"
            >
              <span>Accéder à la page de retrait</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          {/* 1. Sélection du Pays */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-red-600" />
              <span>Sélectionnez votre Pays</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COUNTRIES.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => handleCountryChange(c.code)}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    selectedCountryCode === c.code
                      ? 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <div className="text-left overflow-hidden">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono font-medium">{c.dialCode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Moyen de Réception du pays sélectionné */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Moyen de retrait ({currentCountry.name})
              </label>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {currentCountry.flag} {currentCountry.methods.length} opérateur{currentCountry.methods.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {currentCountry.methods.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                    method === m
                      ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{m}</span>
                  {method === m && <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Numéro de réception */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Numéro de réception ({method})
            </label>
            <div className="flex bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:bg-white transition-all min-h-[48px]">
              <span className="flex items-center px-3.5 bg-slate-100 text-slate-800 font-mono font-black text-xs sm:text-sm border-r border-slate-200 select-none">
                {currentCountry.flag} {currentCountry.dialCode}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ex: 0701020304"
                className="w-full px-3.5 py-3 bg-transparent text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none tracking-wide"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Numéro officiel {method} enregistré dans votre pays ({currentCountry.name}).
            </p>
          </div>

          {/* 4. Nom et prénom du titulaire */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Nom et prénom complet du titulaire
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: KOUASSI KOFFI JEAN"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-600 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Le nom légal de la pièce d’identité associée à la ligne {method}.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-red-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <span>Enregistrement en cours...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer mes coordonnées</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
