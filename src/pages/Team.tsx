import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, ChevronDown, ChevronUp, AlertCircle, Sun, Network } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function Team() {
  const { user } = useAuthStore();
  const { teamStatsCache, setTeamStatsCache } = useAppStore();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [teamStats, setTeamStats] = useState({
    level1: teamStatsCache?.level1 || ([] as any[]),
    level2: teamStatsCache?.level2 || ([] as any[]),
    level3: teamStatsCache?.level3 || ([] as any[]),
    totalBonus: teamStatsCache?.totalBonus || 0
  });
  
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(!teamStatsCache);

  let baseLink = window.location.origin;
  if (baseLink.includes('ais-dev-')) {
    baseLink = baseLink.replace('ais-dev-', 'ais-pre-');
  }
  const referralLink = `${baseLink}/register?ref=${user?.referral_code}`;

  useEffect(() => {
    if (user) {
      fetchTeamStats();
    }
  }, [user]);

  const fetchTeamStats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: bonusesRes } = await supabase.from('transactions').select('amount').eq('user_id', user.id).eq('type', 'referral_bonus');
      const totalBonus = bonusesRes?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      const { data: l1Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at, investments(plan_amount)').eq('referred_by', user.referral_code).order('created_at', { ascending: false });
      const l1 = l1Data || [];
      const l1Codes = l1.map(u => u.referral_code).filter(Boolean);

      let l2: any[] = [];
      let l2Codes: string[] = [];
      if (l1Codes.length > 0) {
        const { data: l2Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at, investments(plan_amount)').in('referred_by', l1Codes).order('created_at', { ascending: false });
        l2 = l2Data || [];
        l2Codes = l2.map(u => u.referral_code).filter(Boolean);
      }

      let l3: any[] = [];
      if (l2Codes.length > 0) {
        const { data: l3Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at, investments(plan_amount)').in('referred_by', l2Codes).order('created_at', { ascending: false });
        l3 = l3Data || [];
      }

      const newStats = {
        level1: l1,
        level2: l2,
        level3: l3,
        totalBonus
      };
      
      setTeamStats(newStats);
      setTeamStatsCache(newStats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = async () => {
    if (!user?.referral_code) return;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3000);
        return;
      }
      throw new Error("Clipboard API not available");
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          setCopyStatus('success');
        } else {
          throw new Error("execCommand failed");
        }
      } catch (fallbackErr) {
        window.prompt("Copiez votre lien réseau ci-dessous :", referralLink);
        setCopyStatus('success'); 
      }
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const totalMembers = teamStats.level1.length + teamStats.level2.length + teamStats.level3.length;

  const renderMemberList = (members: any[]) => {
    if (members.length === 0) {
      return <p className="text-sm text-neutral-500 py-4 text-center bg-white rounded-2xl mt-2 border border-neutral-100 uppercase tracking-widest font-bold">Aucun membre actif.</p>;
    }
    return (
      <div className="mt-4 space-y-3">
        {members.map((member, idx) => {
          const totalInvested = member.investments?.reduce((sum: number, inv: any) => sum + (Number(inv.plan_amount) || 0), 0) || 0;
          return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={member.id} 
            className="flex flex-col gap-3 p-4 bg-white rounded-[20px] border border-neutral-200 hover:border-neutral-300 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-neutral-900 text-sm tracking-tight">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-bold">Inscrit le {format(new Date(member.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 tracking-wider">
                  {member.phone}
                </p>
              </div>
            </div>
            {totalInvested > 0 ? (
              <div className="flex items-center justify-between bg-brand/5 border border-brand/10 rounded-xl p-3 shadow-inner">
                 <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Investissement total</span>
                 <span className="text-sm font-black text-neutral-900">{formatCurrency(totalInvested)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-200 shadow-inner">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Investissement total</span>
                 <span className="text-sm font-black text-neutral-400">0 FCFA</span>
              </div>
            )}
          </motion.div>
        )})}
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 pb-24 font-sans overflow-x-hidden relative">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Dynamic Header */}
      <div className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-4 sticky top-0 z-30 border-b border-neutral-200 rounded-none rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Mon Équipe</h1>
            <p className="text-neutral-500 font-medium text-xs mt-0.5">Invitez et touchez des commissions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 overflow-hidden shadow-sm p-1">
              <img src="https://i.imgur.com/HfAOyni.jpeg" alt="SIM" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-xl mx-auto space-y-8 relative z-10">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[28px] p-8 text-center shadow-sm border border-neutral-200 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <p className="text-brand text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Total Généré par le réseau</p>
          <h2 className="text-[2.5rem] font-black leading-none text-brand tracking-tight flex items-baseline justify-center gap-1 mb-6 relative z-10">
            {formatCurrency(teamStats.totalBonus).replace('FCFA', '').trim()} <span className="text-lg font-bold text-brand/70">FCFA</span>
          </h2>
          
          <div className="inline-flex items-center justify-center px-4 py-2 bg-brand/5 text-brand rounded-xl text-xs font-bold border border-brand/20 mb-6 relative z-10 gap-2 uppercase tracking-wider shadow-inner">
            <Network className="w-4 h-4 text-brand" />
            Membres actifs : <span className="font-black">{totalMembers}</span>
          </div>

          <div className="flex flex-col gap-3 relative z-10 bg-neutral-50 p-3 rounded-[20px] border border-neutral-200 shadow-inner">
            <input 
              readOnly
              type="text"
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-center text-neutral-600 text-xs font-mono tracking-tight focus:outline-none shadow-sm cursor-pointer hover:bg-neutral-50 transition-colors"
            />
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              className="w-full py-4 bg-brand hover:bg-[#c40828] rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] text-xs"
            >
              {copyStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" /> Lien copié !
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copier mon lien
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {copyStatus === 'error' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-left"
              >
                <p className="text-brand text-[10px] font-bold flex items-start gap-2 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 shrink-0" /> 
                  Sélectionnez et copiez manuellement
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="space-y-4 relative z-10">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Topologie du Réseau</h3>
        
          {[
            { level: 1, percent: '20%', members: teamStats.level1, color: 'text-brand', bg: 'bg-brand/10' },
            { level: 2, percent: '2%', members: teamStats.level2, color: 'text-neutral-500', bg: 'bg-neutral-100' },
            { level: 3, percent: '1%', members: teamStats.level3, color: 'text-neutral-500', bg: 'bg-neutral-100' }
          ].map((item, idx) => (
            <motion.div 
              key={item.level}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className="bg-white border border-neutral-200 shadow-sm rounded-[24px] overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setExpandedLevel(expandedLevel === item.level ? null : item.level)}
                className="w-full p-5 flex items-center justify-between bg-transparent cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <div className="text-left flex items-center gap-4">
                  <div className={`w-14 h-14 ${item.bg} border ${item.level === 1 ? 'border-brand/20' : 'border-neutral-200'} rounded-2xl flex items-center justify-center ${item.color} font-black text-xl shadow-sm`}>
                    {item.level}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 text-lg">Niveau {item.level} <span className="text-[10px] font-bold text-brand ml-2 bg-brand/10 px-2 py-1 rounded-md border border-brand/20">{item.percent}</span></p>
                    <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{item.members.length} membre(s)</p>
                  </div>
                </div>
                <div className="text-neutral-500 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                  {expandedLevel === item.level ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {expandedLevel === item.level && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 border-t border-neutral-200 bg-neutral-50"
                  >
                    {isLoading ? <p className="text-[10px] text-neutral-500 text-center py-6 font-semibold uppercase tracking-widest animate-pulse">Chargement...</p> : renderMemberList(item.members)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
