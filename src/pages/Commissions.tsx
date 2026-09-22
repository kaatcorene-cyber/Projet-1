import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Gift, ChevronLeft, Loader2, Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BONUS_LEVELS = [
  { members: 1, amount: 200 },
  { members: 5, amount: 1000 },
  { members: 10, amount: 2000 },
  { members: 30, amount: 6000 },
  { members: 50, amount: 10000 },
  { members: 100, amount: 30000 },
  { members: 150, amount: 50000 },
  { members: 300, amount: 110000 },
  { members: 500, amount: 200000 },
];

export function Commissions() {
  const { user, setUser } = useAuthStore();
  const [activeL1Count, setActiveL1Count] = useState(0);
  const [claimedBonuses, setClaimedBonuses] = useState<number[]>([]);
  const [loadingBonus, setLoadingBonus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const refCode = user.referral_code?.toUpperCase();
      const legacyRefCode = parseInt(user.id.replace(/[^0-9]/g, '').slice(0, 6)).toString();
      
      let orConds = [];
      if (refCode) orConds.push(`referred_by.eq.${refCode}`);
      if (legacyRefCode) orConds.push(`referred_by.eq.${legacyRefCode}`);
      
      const { data: l1Data } = await supabase
        .from('users')
        .select('id')
        .or(orConds.join(','));
            
      const l1Ids = l1Data?.map(u => u.id) || [];
      if (l1Ids.length > 0) {
        const { data: deposits } = await supabase
          .from('transactions')
          .select('user_id')
          .eq('type', 'deposit')
          .eq('status', 'approved')
          .in('user_id', l1Ids);
        const activeIds = new Set(deposits?.map(d => d.user_id));
        setActiveL1Count(activeIds.size);
      } else {
        setActiveL1Count(0);
      }

      const { data: claims } = await supabase
        .from('transactions')
        .select('reference')
        .eq('type', 'team_bonus')
        .eq('user_id', user.id);
      
      const claimed = claims?.map(c => parseInt(c.reference.replace('bonus_', ''))).filter(n => !isNaN(n)) || [];
      setClaimedBonuses(claimed);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const claimBonus = async (level: typeof BONUS_LEVELS[0]) => {
    if (loadingBonus === level.members || !user) return;
    setLoadingBonus(level.members);
    try {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('type', 'team_bonus')
        .eq('user_id', user.id)
        .eq('reference', `bonus_${level.members}`)
        .maybeSingle();
      
      if (existing) {
        toast.error("Bonus déjà réclamé");
        setLoadingBonus(null);
        return;
      }
      
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'team_bonus',
        amount: level.amount,
        status: 'approved',
        reference: `bonus_${level.members}`
      });
      if (txError) throw txError;
      
      const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
      const newBalance = (userData?.balance || 0) + level.amount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      
      toast.success(`Bonus de ${formatCurrency(level.amount)} réclamé !`);
      setClaimedBonuses(prev => [...prev, level.members]);
      setUser({ ...user, balance: newBalance });
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la réclamation");
    } finally {
      setLoadingBonus(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-10 pb-32 font-sans text-slate-900 relative">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Commissions</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Bonus d'invitation</p>
        </div>
      </header>
      
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
           <Trophy className="w-5 h-5" />
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Membres Actifs (Niveau 1)</p>
        <p className="text-slate-900 font-black text-2xl">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mt-1" /> : activeL1Count}</p>
        <p className="text-xs text-slate-400 font-medium mt-1">Seuls les membres ayant rechargé leur compte sont comptabilisés.</p>
      </div>

      <div className="space-y-4">
        {BONUS_LEVELS.map((level, idx) => {
          const isClaimed = claimedBonuses.includes(level.members);
          const isUnlocked = activeL1Count >= level.members;
          const progress = Math.min(100, Math.max(0, (activeL1Count / level.members) * 100));

          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-3xl p-5 border shadow-sm relative ${isClaimed ? 'border-emerald-200 bg-emerald-50/30' : isUnlocked ? 'border-emerald-400' : 'border-slate-200'}`}
            >
              {isClaimed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isClaimed || isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isClaimed || isUnlocked ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {level.members} Membre{level.members > 1 ? 's' : ''} actif{level.members > 1 ? 's' : ''}
                  </p>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(level.amount)}</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Progression</span>
                  <span className="text-xs font-black text-slate-700">{activeL1Count}/{level.members}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${isClaimed ? 'bg-emerald-400' : isUnlocked ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <button
                onClick={() => claimBonus(level)}
                disabled={!isUnlocked || isClaimed || loadingBonus === level.members}
                className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  isClaimed
                    ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                    : isUnlocked
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loadingBonus === level.members ? <Loader2 className="w-5 h-5 animate-spin" /> : isClaimed ? 'Déjà réclamé' : 'Réclamer mon bonus'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
