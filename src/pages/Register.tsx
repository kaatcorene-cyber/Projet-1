import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';
import { AppLogo } from '../components/AppLogo';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    country: "Cote d'Ivoire",
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
    const cleanPhone = formData.phone.replace(/\s/g, '');

    try {
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('country', formData.country)
        .maybeSingle();

      if (existError) console.warn("DB Check Warning:", existError);

      if (existingUser) {
        setError('Ce numéro est déjà utilisé en Côte d’Ivoire');
        setLoading(false);
        return;
      }

      const myReferralCode = 'AG' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: "Membre",
            last_name: "Agri",
            phone: cleanPhone,
            country: formData.country,
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
    <div className="h-screen flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="text-center mb-6 flex flex-col items-center relative z-10">
        <div className="mb-4">
           <AppLogo imgClassName="h-10 w-auto object-contain max-h-12" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-1 text-gray-900">Inscription</h1>
        <p className="text-gray-500 font-medium text-xs">Rejoignez la plateforme agricole</p>
      </div>

      <div className="w-full relative z-10">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5 hidden">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Pays</label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-white border border-black/5 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium appearance-none opacity-80"
                required
                disabled
              >
                <option value="Cote d'Ivoire">Côte d'Ivoire</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Téléphone</label>
            <div className="flex bg-white border border-black/10 shadow-sm rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <span className="flex items-center px-3.5 bg-gray-50 text-gray-700 font-bold text-xs border-r border-black/10">
                +225
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-3 text-gray-900 focus:outline-none bg-transparent placeholder:text-gray-400 font-medium tracking-wide text-sm"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-black/10 shadow-sm rounded-xl px-3.5 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-all font-medium text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-widest">Code parrain</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              readOnly
              className="w-full bg-gray-100 border border-black/10 shadow-inner rounded-xl px-3.5 py-3 text-gray-500 focus:outline-none transition-all font-medium uppercase opacity-70 cursor-not-allowed text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl mt-6 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? 'Création du compte...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6 font-medium">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
