import { Sun } from 'lucide-react';
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
      const { data: existingUser, error: existError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('country', formData.country)
        .maybeSingle();

      if (existError) console.warn("DB Check Warning:", existError);

      if (existingUser) {
        setError('Ce numéro est déjà utilisé dans ce pays');
        setLoading(false);
        return;
      }

      const myReferralCode = formData.firstName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: cleanPhone,
            country: formData.country,
            password_hash: formData.password,
            referral_code: myReferralCode,
            referred_by: formData.referralCode ? formData.referralCode.trim().toUpperCase() : null,
            balance: 500 // Signup bonus
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
        const { error: txError } = await supabase.from('transactions').insert([{
          user_id: data.id,
          type: 'signup_bonus',
          amount: 500,
          status: 'completed'
        }]);
        if (txError) console.warn("Failed to insert bonus", txError);
        
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
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto relative overflow-x-hidden bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        <div className="mb-6 flex items-center justify-center gap-1.5">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3 text-white">Rejoindre le Réseau</h1>
        <p className="text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
          Bonus de bienvenue : 500 FCFA offerts !
        </p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative z-10">
        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black border-r border-white/10 pr-3">
                +225
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/^\+225/, '') })}
                className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl pl-[4.5rem] pr-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all placeholder:text-gray-600 font-medium tracking-wide"
                placeholder="0123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Confirmer</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Code parrain (Optionnel)</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/5 shadow-inner rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:bg-[#1f1f1f] transition-all font-medium uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl mt-8 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion au réseau...' : 'Rejoindre Soleil-Power'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8 font-medium">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-bold tracking-wide transition-colors">
            Ouvrir une session
          </Link>
        </p>
      </div>
    </div>
  );
}
