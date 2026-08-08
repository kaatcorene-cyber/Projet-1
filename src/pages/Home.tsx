import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Info, ArrowDownToLine, Gift, Image as ImageIcon, Zap, Clock , Smartphone, Download, Package, ShieldCheck, TrendingUp, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_IMAGES = [
  "https://i.imgur.com/6VqZ5tK.jpeg",
  "https://i.imgur.com/OmhUdVm.jpeg",
  "https://i.imgur.com/kytswvT.jpeg",
  "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=800" // Farm/Cows
];

export function Home() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const [showJoinModal, setShowJoinModal] = useState(() => !sessionStorage.getItem('hasSeenJoinGroup'));
  const closeJoinModal = () => {
    setShowJoinModal(false);
    sessionStorage.setItem('hasSeenJoinGroup', 'true');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'investment_plans').single();
        if (data && data.value) {
          const plans = JSON.parse(data.value);
          const active = plans.filter((p: any) => p.isActive !== false);
          active.sort((a: any, b: any) => Number(String(a.amount).replace(/\D/g, '')) - Number(String(b.amount).replace(/\D/g, '')));
          setActivePlans(active);
        } else setActivePlans([]);
      } catch (err) {
        console.error("Error fetching plans", err);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    setLoading(index);
    setMessage(null);

    const planAmount = Number(String(plan.amount).replace(/\D/g, ''));
    const planDaily = Number(String(plan.daily).replace(/\D/g, ''));

    if (user.balance < planAmount) {
      setMessage({ type: 'error', text: 'Solde insuffisant pour ce pack.' });
      setLoading(null);
      return;
    }

    try {
      const newBalance = user.balance - planAmount;
      const { error: userError } = await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      if (userError) throw userError;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const { error: investError } = await supabase.from('investments').insert([{
        user_id: user.id, plan_amount: planAmount, daily_yield: planDaily, end_date: endDate.toISOString(), status: 'active'
      }]);
      if (investError) throw investError;

      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id, type: 'investment', amount: planAmount, status: 'completed', reference: `INV-${Date.now()}`
      }]);
      if (txError) throw txError;

      setUser({ ...user, balance: newBalance });
      setShowSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/revenues';
      }, 2500);

    } catch (err: any) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'activation.' });
    } finally {
      if (!showSuccess) setLoading(null);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? Number(amount.replace(/\D/g, '')) : amount;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const quickLinks = [
    { icon: ImageIcon, label: 'Preuves', path: '/preuves', color: 'bg-purple-500' },
    { icon: ArrowDownToLine, label: 'Recharger', path: '/deposit', color: 'bg-emerald-500' },
    { icon: Gift, label: 'Commissions', path: '/commissions', color: 'bg-orange-500' },
    { icon: Clock, label: 'Historique', path: '/history', color: 'bg-blue-500' },
  ];

  return (
    <div className="px-4 pt-4 pb-32 min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      
      <AnimatePresence>
        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full flex flex-col shadow-2xl relative"
            >
              <div className="w-full h-40 relative">
                <img src="https://i.imgur.com/VD6ze7O.png" alt="Join us" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              <div className="p-6 flex flex-col items-center text-center pt-2">
                <h2 className="text-2xl font-black text-slate-900 mb-4">Rejoignez-nous !</h2>
                <p className="text-slate-700 text-[15px] font-serif italic mb-8 leading-relaxed">
                  "🤗 Bienvenue, cher membre sur ElevFinAi ! ElevFinAi est une plateforme dédiée au secteur de l’élevage en Côte d’Ivoire 🇨🇮, visant à valoriser et soutenir les activités d’élevage à travers des solutions modernes et accessibles. Merci pour votre confiance et bienvenue dans l’aventure ! 🐄 🐐 🐑 🐖 🐔"
                </p>
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href="https://t.me/+w9yTyaXn7AxjMzc0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={closeJoinModal}
                    className="w-full py-3.5 bg-[#0088cc] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 active:scale-95 transition-transform"
                  >
                    Rejoindre le groupe
                  </a>
                  <button 
                    onClick={closeJoinModal}
                    className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-transform"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center border border-slate-200 shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Pack Activé !</h3>
              <p className="text-slate-500 font-medium mb-6 text-sm">Votre investissement est en cours de traitement. Redirection...</p>
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-6 shadow-md border border-slate-200">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={BANNER_IMAGES[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-end">
           <div className="flex gap-1.5">
             {BANNER_IMAGES.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-4 bg-emerald-500' : 'w-1.5 bg-white/50'}`} />
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {quickLinks.map((link, i) => (
          <Link key={i} to={link.path} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl ${link.color} flex items-center justify-center text-white shadow-lg shadow-slate-200/50 group-hover:scale-105 transition-transform`}>
               <link.icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">{link.label}</span>
          </Link>
        ))}
      </div>

      <Link to="/app" className="flex items-center justify-between bg-emerald-500 text-white rounded-3xl p-4 mb-8 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Application Mobile</h3>
            <p className="text-xs text-emerald-100 font-medium">Téléchargez ElevFinAi</p>
          </div>
        </div>
        <div className="bg-white text-emerald-600 text-xs font-black px-4 py-2.5 rounded-full shadow-sm">
          Installer
        </div>
      </Link>

      <div className="mb-6 flex items-center justify-between">
         <div>
             <h1 className="text-xl font-black text-slate-900 tracking-tight">Packs Disponibles</h1>
             <p className="text-slate-500 text-xs mt-1">Commencez à générer des revenus</p>
         </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      <div className="space-y-4 max-w-[340px] mx-auto">
        {isLoadingPlans ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : activePlans.length === 0 ? (
          <div className="text-center py-12"><p className="text-slate-500 font-medium">Aucun pack disponible.</p></div>
        ) : (
          activePlans.map((plan, idx) => {
            const hasInsufficientBalance = (user?.balance || 0) < plan.amount;
            return (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex gap-4 items-center">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-slate-100">
                   <img src={plan.image || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start gap-2">
                     <div>
                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">Pack Élevage</span>
                       <h3 className="text-xl font-black text-slate-900 leading-tight">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                       <Clock className="w-3.5 h-3.5 text-slate-500" />
                       <span className="text-slate-700 font-bold text-xs">{plan.duration || 30} Jours</span>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Gain par jour</span>
                    <span className="text-emerald-600 font-black text-sm">{formatCurrency(plan.daily)}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Gain total</span>
                    <span className="text-slate-900 font-black text-sm">{formatCurrency(plan.total)}</span>
                 </div>
              </div>

              <button
                onClick={() => {
                  if (hasInsufficientBalance) {
                    setMessage({ type: 'error', text: 'Votre solde est insuffisant pour payer ce pack.' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => setMessage(null), 3000);
                  } else {
                    handleInvest(plan, idx);
                  }
                }}
                disabled={loading === idx}
                className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${hasInsufficientBalance ? 'bg-slate-100 text-slate-500 border border-slate-200 active:scale-95' : 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20'}`}
              >
                {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Payer'}
              </button>
            </motion.div>
          )})
        )}
      </div>


    </div>
  );
}
