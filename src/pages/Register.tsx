import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, checkDbSetup } from '../lib/supabase';

export function Register() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
      const myReferralCode = formData.firstName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: cleanPhone,
            country: formData.country,
            password_hash: formData.password, // In a real app, hash this!
            referral_code: myReferralCode,
            referred_by: formData.referralCode ? formData.referralCode.trim().toUpperCase() : null,
            balance: 100 // Signup bonus
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
        // Record the signup bonus transaction safely
        const { error: txError } = await supabase.from('transactions').insert([{
          user_id: data.id,
          type: 'signup_bonus',
          amount: 100,
          status: 'completed'
        }]);
        if (txError) console.warn("Failed to insert bonus", txError);

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
           <div className="absolute inset-0 bg-red-100 blur-3xl rounded-full opacity-50"></div>
          <img src="https://i.imgur.com/awFyFRj.png" alt="QUALCOMM" className="h-[40px] object-contain relative z-10" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Créer un compte</h1>
        <p className="text-red-100 font-medium text-sm">Bonus de bienvenue : 100 FCFA offerts !</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-white/20 pr-3">+225</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/^\+225/, '') })}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-400 font-medium tracking-wide"
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
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirmer</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
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
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-red-950 hover:bg-gray-100 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-red-700 hover:text-red-800 font-bold tracking-wide transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
