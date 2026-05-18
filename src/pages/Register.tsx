import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    country: "Cote d'Ivoire",
    password: '',
    confirmPassword: '',
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

      // Generate a simple referral code if none generated yet
      const myReferralCode = 'USER' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: '',
            last_name: '',
            phone: cleanPhone,
            country: formData.country,
            password_hash: formData.password, // In a real app, hash this!
            referral_code: myReferralCode,
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

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto relative overflow-hidden text-gray-900">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-white p-3 rounded-2xl shadow-xl mb-4 relative">
           <div className="absolute inset-0 bg-purple-100 blur-3xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/bjYgoI6.png" alt="SIMcom" className="h-[40px] rounded-full object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 🌟</h1>
        <p className="text-purple-900 font-medium text-sm">𝑪𝒓𝒆́𝒆𝒛 𝒗𝒐𝒕𝒓𝒆 𝒄𝒐𝒎𝒑𝒕𝒆 𝒑𝒐𝒖𝒓 𝒄𝒐𝒎𝒎𝒆𝒏𝒄𝒆𝒓.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3">
                +225
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/^\+225/, '') })}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-400 font-medium tracking-wide"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Code parrain (Optionnel)</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-950 hover:bg-gray-100 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-purple-700 hover:text-purple-800 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
