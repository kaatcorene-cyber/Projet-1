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
  Lock,
  ArrowRight
} from 'lucide-react';

export interface WithdrawalDetails {
  method: 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money';
  phone: string;
  fullName: string;
  savedAt: string;
}

export default function WithdrawInfo() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [method, setMethod] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing details
  useEffect(() => {
    if (!user) return;
    const storageKey = `translogis_withdraw_info_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: WithdrawalDetails = JSON.parse(saved);
        if (parsed.method) setMethod(parsed.method);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.fullName) setFullName(parsed.fullName);
      } catch (e) {}
    } else if (user.phone) {
      setPhone(user.phone);
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

    const cleanPhone = phone.trim();
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
        method,
        phone: cleanPhone,
        fullName: cleanName,
        savedAt: new Date().toISOString()
      };

      // 1. Save in localStorage
      const storageKey = `translogis_withdraw_info_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(details));

      // 2. Also try to persist to Supabase if possible (update address or withdrawal_info column)
      try {
        await supabase
          .from('users')
          .update({
            // Store method and full name in metadata if needed
            address: JSON.stringify(details)
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
        <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Coordonnées de Retrait</span>
      </header>

      <main className="max-w-lg mx-auto pt-4 px-3 sm:px-0 space-y-4">
        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Coordonnées enregistrées avec succès !</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              Vos informations ont été sauvegardées en toute sécurité. Vous pouvez maintenant effectuer un retrait immédiatement.
            </p>
            <Link
              to="/withdraw"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-all shadow-sm"
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
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Moyen de Réception */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Moyen de réception
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                    method === m
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{m}</span>
                  {method === m && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro de réception */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Numéro de réception ({method})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 0701020304"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Le numéro sur lequel vous recevrez les transferts d’argent.
            </p>
          </div>

          {/* Nom et prénom du titulaire */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Nom et prénom du titulaire
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
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Le nom légal enregistré sur votre compte {method}.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <span>Enregistrement en cours...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer mes informations</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
