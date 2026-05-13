import { } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    referralCode: (searchParams.get('ref') && searchParams.get('ref') !== 'undefined') ? searchParams.get('ref') : ''
  });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    const cleanPhone = formData.phone.replace(/\s/g, ''); // Clean spaces

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Le numéro de téléphone doit contenir exactement 10 chiffres (ex: 0102030405).');
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('country', "Cote d'Ivoire")
        .maybeSingle();

      if (existError) console.warn("DB Check Warning:", existError);

      if (existingUser) {
        setError('Ce numéro est déjà utilisé dans ce pays');
        setLoading(false);
        return;
      }

      const myReferralCode = "SIM" + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: "Membre",
            last_name: "SIM",
            phone: cleanPhone,
            country: "Cote d'Ivoire",
            password_hash: formData.password,
            referral_code: myReferralCode,
            referred_by: formData.referralCode ? formData.referralCode.trim().toUpperCase() : null,
            balance: 0
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

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 mx-auto bg-white text-neutral-900 font-sans relative overflow-hidden">
      <div className="max-w-md w-full mx-auto relative z-10 pt-16 pb-12">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-neutral-100 shadow-xl mb-4 p-1 shrink-0 overflow-hidden">
            <img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo SIM" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2 text-neutral-900 drop-shadow-sm">Créer un compte</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 relative shadow-sm border border-neutral-100">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-4 bg-brand/10 border border-brand/20 rounded-2xl text-brand text-xs font-bold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-neutral-500 font-bold text-sm pointer-events-none">
                  +225
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-14 pr-4 py-4 text-neutral-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-neutral-100 transition-all placeholder:text-neutral-400 text-sm font-bold"
                  placeholder="0102030405"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-4 text-neutral-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-neutral-100 transition-all placeholder:text-neutral-400 text-sm font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Code parrain (Optionnel)</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-4 text-neutral-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-neutral-100 transition-all placeholder:text-neutral-400 text-sm font-bold uppercase"
                placeholder="Optionnel"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-[#c40828] text-white font-black uppercase tracking-wider py-4 rounded-2xl mt-8 transition-all shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] active:scale-95 disabled:opacity-50 text-xs"
            >
              {loading ? 'Création...' : 'S\'inscrire'}
            </button>
          </form>

          <p className="text-center text-neutral-500 text-xs mt-6 font-medium">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand hover:text-[#c40828] font-bold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
