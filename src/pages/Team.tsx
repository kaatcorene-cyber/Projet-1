import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, TrendingUp, AlertCircle, HandCoins, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Team() {
  const { user, refreshUser } = useAuthStore();
  const { teamStatsCache, setTeamStatsCache } = useAppStore();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [teamStats, setTeamStats] = useState({
    level1: teamStatsCache?.level1 || ([] as any[]),
    level2: teamStatsCache?.level2 || ([] as any[]),
    level3: teamStatsCache?.level3 || ([] as any[]),
    totalBonus: teamStatsCache?.totalBonus || 0
  });
  
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

  // Auto-correct the domain for sharing so outside users don't hit the private AI Studio dev wall
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

    try {
      // 1. Fetch bonuses
      const { data: bonusesRes } = await supabase.from('transactions').select('amount').eq('user_id', user.id).eq('type', 'referral_bonus');
      const totalBonus = bonusesRes?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      // 2. Fetch Level 1
      const { data: l1Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at, investments(plan_amount)').eq('referred_by', user.referral_code).order('created_at', { ascending: false });
      const l1 = l1Data || [];
      const l1Codes = l1.map(u => u.referral_code).filter(Boolean);

      // 3. Fetch Level 2
      let l2: any[] = [];
      let l2Codes: string[] = [];
      if (l1Codes.length > 0) {
        const { data: l2Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at, investments(plan_amount)').in('referred_by', l1Codes).order('created_at', { ascending: false });
        l2 = l2Data || [];
        l2Codes = l2.map(u => u.referral_code).filter(Boolean);
      }

      // 4. Fetch Level 3
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
    }
  };

  const copyCode = async () => {
    if (!user?.referral_code) return;
    
    try {
      // 1. Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3000);
        return;
      }
      throw new Error("Clipboard API not available");
    } catch (err) {
      // 2. Fallback
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
        // 3. ABSOLUTE FINAL FALLBACK: Native Prompt (100% reliable even in locked iframes)
        window.prompt("Copiez votre lien de parrainage ci-dessous :", referralLink);
        setCopyStatus('success'); // Assume success if they saw the prompt
      }
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const totalMembers = teamStats.level1.length + teamStats.level2.length + teamStats.level3.length;

  const renderMemberList = (members: any[]) => {
    if (members.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500 text-sm font-semibold">
          Aucun membre à ce niveau
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {members.map(member => {
          const firstInvestment = member.investments?.[0]?.plan_amount;
          const investedAmount = firstInvestment ? Number(firstInvestment) : 0;
          
          return (
            <div key={member.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <div>
                <p className="font-bold text-zinc-50 text-sm tracking-tight">{member.phone}</p>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                  {format(new Date(member.created_at), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                {investedAmount > 0 ? (
                  <>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(investedAmount)}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Dépôt</p>
                  </>
                ) : (
                  <p className="text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-2 py-1 rounded inline-block border border-zinc-800">
                    Aucun
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans">
      <header className="flex justify-between items-center gap-4 pb-4 border-b border-zinc-800/60 mb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight">Mon Équipe</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-1">Gagnez jusqu'à 25% (20% - 3% - 2%)</p>
        </div>
        <img src="https://i.imgur.com/qRUc5aF.png" alt="Fuel•Max" className="w-20 h-20 rounded-2xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-white flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

      <div className="animate-fade-in relative z-10 pb-6">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-500/10 rounded-full blur-[30px] pointer-events-none"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Gains d'équipe</p>
              <h2 className="text-2xl font-black text-zinc-50 tracking-tight">{formatCurrency(teamStats.totalBonus)}</h2>
            </div>
            <div className="flex bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl text-sm font-bold items-center gap-1.5 border border-red-500/20 shadow-inner">
              <Users className="w-4 h-4" />
              {totalMembers}
            </div>
          </div>

          <div className="flex gap-2 relative z-10">
            <input 
              readOnly
              type="text"
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 w-0 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2 text-zinc-300 text-xs font-mono truncate focus:outline-none focus:border-red-500/50 transition-colors shadow-inner"
            />
            <button 
              onClick={copyCode}
              className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              {copyStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {copyStatus === 'error' && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left">
              <p className="text-amber-500 text-[10px] font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
                <span>Cliquez sur le lien, maintenez appuyé, puis "Copier".</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-1.5 gap-1.5 mb-4 shadow-inner">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => setExpandedLevel(level)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 ${
                expandedLevel === level 
                  ? 'bg-zinc-800 text-zinc-50 shadow-md border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-1">
                Niv. {level}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${expandedLevel === level ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-500'}`}>
                  {level === 1 ? teamStats.level1.length : 
                   level === 2 ? teamStats.level2.length : 
                   teamStats.level3.length}
                </span>
              </div>
              <span className={`text-[10px] ${expandedLevel === level ? 'text-red-400' : 'text-zinc-600'}`}>
                {level === 1 ? '20%' : level === 2 ? '3%' : '2%'}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden min-h-[200px] shadow-xl">
          <div className="p-4">
            {renderMemberList(
              expandedLevel === 1 ? teamStats.level1 :
              expandedLevel === 2 ? teamStats.level2 :
              teamStats.level3
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
