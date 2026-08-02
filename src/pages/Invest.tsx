import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Zap, ShieldCheck, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PLANS: any[] = [];

export function Invest() {
  const { user, refreshUser } = useAuthStore();
  const { settingsCache, setSettingsCache, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();
  
  const getInitialPlans = () => {
    if (!settingsCache) return [];
    const dbPlansStr = settingsCache.find(s => s.key === 'investment_plans');
    if (dbPlansStr && dbPlansStr.value) {
      try {
        return JSON.parse(dbPlansStr.value);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [plans, setPlans] = useState<any[]>(getInitialPlans());
  const [isLoadingPlans, setIsLoadingPlans] = useState(!settingsCache);
  const [loading, setLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (settingsCache) {
      applyPlans(settingsCache);
      if (plans.length > 0) {
        setIsLoadingPlans(false);
      }
    }
  }, [settingsCache]);

  useEffect(() => {
    fetchPlans();
    const intervalId = setInterval(() => {
      refreshUser();
      fetchPlans();
    }, 60000 * 2);
    return () => clearInterval(intervalId);
  }, []);

  const applyPlans = (data: any[]) => {
    const dbPlansStr = data.find(s => s.key === 'investment_plans');
    if (dbPlansStr && dbPlansStr.value) {
      try {
        const parsed = JSON.parse(dbPlansStr.value);
        setPlans(parsed);
        if (parsed.length > 0) setIsLoadingPlans(false);
      } catch (e) {
        setPlans(DEFAULT_PLANS);
      }
    } else {
      setPlans(DEFAULT_PLANS);
    }
  };

  const fetchPlans = async () => {
    const { data: dbPlansStr } = await supabase.from('settings').select('*');
    if (dbPlansStr) {
      setSettingsCache(dbPlansStr);
      applyPlans(dbPlansStr);
    } else if (!settingsCache) {
      setPlans(DEFAULT_PLANS);
    }
    setIsLoadingPlans(false);
  };

  const activePlans = [...plans].sort((a, b) => a.amount - b.amount);

  const handleInvest = async (plan: any, index: number) => {
    if (!user) return;
    if (Number(user.balance) < plan.amount) {
      setMessage({ type: 'error', text: 'Solde insuffisant. Veuillez recharger votre compte.' });
      return;
    }
    setLoading(index);
    setMessage(null);
    try {
      const newBalance = Number(user.balance) - plan.amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);
      if (updateError) throw updateError;
      
      const { error: investError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_amount: plan.amount,
          daily_yield: plan.daily,
          status: 'active',
          end_date: new Date(Date.now() + (plan.duration || 60) * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (investError) throw investError;
      
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: plan.amount,
          type: 'investment',
          status: 'completed',
          reference: `INVESTISSEMENT - ${plan.name}`
        }]);
      
      if (txError) console.error("Error inserting transaction", txError);

      
      const { data: updatedInvestments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (updatedInvestments) {
        setInvestmentsCache(updatedInvestments);
      }

      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 600);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
      setLoading(null);
    }
  };

  return (
    <div className="px-5 pt-12 pb-32 min-h-screen bg-slate-50 max-w-lg mx-auto font-sans">
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-teal-500"></div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative"
              >
                <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping"></div>
                <CheckCircle2 className="w-12 h-12 text-orange-500 relative z-10" />
              </motion.div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">Contrat Activé !</h3>
              <p className="text-slate-500 font-medium mb-6">Votre investissement a été validé avec succès. Redirection vers vos contrats en cours...</p>

              <div className="w-full flex justify-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 15s linear infinite;
        }
      `}</style>
      
      {/* Decorative Header (Marquee) */}
      <div className="relative mb-8 overflow-hidden bg-gradient-to-r from-orange-700 to-orange-600 rounded-2xl shadow-lg shadow-orange-600/20 py-3.5 flex items-center w-full border border-white/10">
         <div className="whitespace-nowrap animate-scroll text-white font-medium tracking-wide text-sm flex items-center gap-3">
           <span className="text-lg">👋</span>
           <span className="font-bold">Bienvenue sur Olam Agri, leader de l'investissement agricole.</span>
           <span className="w-1.5 h-1.5 rounded-full bg-green-300 opacity-80"></span>
           <span>Sécurisez votre avenir avec nos contrats à haut rendement, garantis, professionnels et transparents.</span>
         </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl mb-6 flex items-center gap-3 border shadow-sm ${
          message.type === 'success' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-orange-50 text-orange-800 border-orange-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      <div className="space-y-6 relative z-10">
        {isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-10 h-10 rounded-full border-4 border-orange-600/20 border-t-orange-600 animate-spin"></div>
          </div>
        ) : activePlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <Zap className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Aucun contrat disponible actuellement.</p>
          </div>
        ) : (
          activePlans.map((plan, idx) => {
            const hasInsufficientBalance = (user?.balance || 0) < plan.amount;
            return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="bg-white rounded-[20px] p-4 flex flex-col gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-[14px] overflow-hidden shrink-0 shadow-sm bg-slate-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                  <img src={plan.image || '/app_icon.png'} alt="Plan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-xl font-black text-slate-900 truncate">{formatCurrency(plan.amount)}</p>
                    
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs font-medium bg-slate-50 rounded-xl p-2.5 border border-slate-100/50">
                    <div className="flex flex-col flex-1">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Gain Journalier</span>
                      <span className="text-slate-800 font-black">{formatCurrency(plan.daily)}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-slate-200"></div>
                    <div className="flex flex-col flex-1 items-end">
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Total Estimé</span>
                      <span className="text-orange-600 font-black">{formatCurrency(plan.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleInvest(plan, idx)}
                disabled={loading === idx || hasInsufficientBalance}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2 shadow-sm ${
                  hasInsufficientBalance 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'text-white bg-slate-900 hover:bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-orange-700 group-hover:to-orange-600 shadow-slate-200'
                }`}
              >
                {loading === idx ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasInsufficientBalance ? (
                  'Solde insuffisant'
                ) : (
                  'Signer le contrat'
                )}
              </button>
            </motion.div>
          )})
        )}
      </div>
    </div>
  );
}
