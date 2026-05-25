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
  const [mainTab, setMainTab] = useState<'membres' | 'salaire'>('membres');
  const [claimingState, setClaimingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [claimMessage, setClaimMessage] = useState('');
  
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
        <div className="text-center py-8 text-gray-400 text-sm font-semibold">
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
            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900 text-sm tracking-tight">{member.phone}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                  {format(new Date(member.created_at), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                {investedAmount > 0 ? (
                  <>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(investedAmount)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Dépôt</p>
                  </>
                ) : (
                  <p className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block border border-gray-200">
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

  const activeSubsCount = teamStats.level1.filter(m => {
    const firstInv = m.investments?.[0]?.plan_amount;
    return firstInv && Number(firstInv) >= 5000;
  }).length;

  const salaryMilestones = [
    { requirement: 20, reward: 2000 },
    { requirement: 40, reward: 4000 },
    { requirement: 60, reward: 6000 },
    { requirement: 80, reward: 8000 },
    { requirement: 100, reward: 10000 },
    { requirement: 120, reward: 12000 },
    { requirement: 140, reward: 14000 },
    { requirement: 160, reward: 16000 },
    { requirement: 180, reward: 18000 },
    { requirement: 200, reward: 20000 },
  ];

  const currentMilestone = [...salaryMilestones].reverse().find(m => activeSubsCount >= m.requirement);
  const eligibleSalary = currentMilestone ? currentMilestone.reward : 0;

  const claimSalary = async () => {
    if (!user || eligibleSalary === 0 || claimingState === 'loading') return;
    
    // Check time - 20:00 rule
    const now = new Date();
    if (now.getHours() < 20) {
      setClaimingState('error');
      setClaimMessage('Le salaire est disponible uniquement à partir de 20h00.');
      setTimeout(() => setClaimingState('idle'), 3000);
      return;
    }

    setClaimingState('loading');
    
    try {
      // Check if already claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: existingClaims } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'salary_bonus')
        .gte('created_at', today.toISOString());
        
      if (existingClaims && existingClaims.length > 0) {
        setClaimingState('error');
        setClaimMessage('Vous avez déjà réclamé votre salaire aujourd\'hui.');
        setTimeout(() => setClaimingState('idle'), 3000);
        return;
      }

      // Add balance
      const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
      const newBalance = (userData?.balance || 0) + eligibleSalary;
      
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      
      // Log transaction
      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'salary_bonus',
        amount: eligibleSalary,
        status: 'completed',
        reference: `Salaire journalier (${activeSubsCount} membres)`
      }]);
      
      setClaimingState('success');
      setClaimMessage(`Salaire de ${eligibleSalary}F réclamé avec succès!`);
      
      if (refreshUser) await refreshUser(); // update local balance
      setTimeout(() => setClaimingState('idle'), 3000);
      
    } catch (err) {
      console.error(err);
      setClaimingState('error');
      setClaimMessage('Une erreur est survenue.');
      setTimeout(() => setClaimingState('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans">
      <header className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200/60 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Équipe</h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Gagnez jusqu'à 13%</p>
        </div>
        <img src="https://i.imgur.com/bjYgoI6.png" alt="Logo" className="w-20 h-20 rounded-2xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-white flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

      {mainTab === 'membres' ? (
        <div className="animate-fade-in relative z-10 pb-6">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/60 rounded-2xl p-4 shadow-sm mb-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Gains d'équipe</p>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(teamStats.totalBonus)}</h2>
              </div>
              <div className="flex bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold items-center gap-1.5 border border-purple-100">
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
                className="flex-1 w-0 bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 text-xs font-mono truncate focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                onClick={copyCode}
                className="px-4 py-2 bg-gray-900 hover:bg-black rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
              >
                {copyStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {copyStatus === 'error' && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
                <p className="text-amber-700 text-[10px] font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
                  <span>Cliquez sur le lien, maintenez appuyé, puis "Copier".</span>
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
              <button
                onClick={() => setMainTab('salaire')}
                className="w-full flex justify-center items-center gap-2 py-3.5 text-sm font-black tracking-wider uppercase rounded-xl transition-all duration-300 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
              >
                <HandCoins className="w-5 h-5" />
                Salaire
              </button>
            </div>
          </div>

          <div className="flex bg-gray-200/50 backdrop-blur-md rounded-2xl p-1.5 gap-1.5 mb-4 shadow-inner">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setExpandedLevel(level)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  expandedLevel === level 
                    ? 'bg-white text-gray-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] border border-gray-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                Niv. {level}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${expandedLevel === level ? 'bg-purple-100 text-purple-700 border border-purple-200/50' : 'bg-gray-200 text-gray-500'}`}>
                  {level === 1 ? teamStats.level1.length : 
                   level === 2 ? teamStats.level2.length : 
                   teamStats.level3.length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl overflow-hidden min-h-[200px] shadow-sm">
            <div className="p-4">
              {renderMemberList(
                expandedLevel === 1 ? teamStats.level1 :
                expandedLevel === 2 ? teamStats.level2 :
                teamStats.level3
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in relative z-10 pb-6">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-2xl font-black text-purple-800 tracking-tighter uppercase">Salaire</h2>
            <button
              onClick={() => setMainTab('membres')}
              className="bg-gray-200/60 hover:bg-gray-300/80 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Retour
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm p-4 cursor-default">
            
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-5 mb-5 text-white shadow-sm border border-purple-400/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-100 text-[10px] font-bold uppercase tracking-wider mb-1">Membres Actifs (Dépôt ≥ 5000F)</p>
                  <p className="text-4xl font-black tracking-tight">{activeSubsCount}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="mt-4 border-t border-white/20 pt-4">
                {eligibleSalary > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-purple-100">
                      <span className="text-xs font-semibold">Salaire disponible :</span>
                      <span className="text-lg font-black">{formatCurrency(eligibleSalary)}</span>
                    </div>
                    
                    {claimingState === 'error' && (
                      <div className="bg-red-500/20 text-red-100 text-xs p-2 rounded-lg border border-red-500/30 text-center font-medium">
                        {claimMessage}
                      </div>
                    )}
                    
                    {claimingState === 'success' && (
                      <div className="bg-emerald-500/20 text-emerald-100 text-xs p-2 rounded-lg border border-emerald-500/30 text-center font-medium flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {claimMessage}
                      </div>
                    )}

                    <button
                      onClick={claimSalary}
                      disabled={claimingState === 'loading' || claimingState === 'success'}
                      className="w-full bg-white text-purple-700 font-bold py-3 text-sm rounded-xl hover:bg-purple-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {claimingState === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'Réclamer mon salaire'
                      )}
                    </button>
                    <p className="text-center text-[10px] text-purple-200 mt-2 font-medium opacity-80">
                      Le salaire est disponible chaque jour à partir de 20h00.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-xs text-purple-100 font-medium">
                      Atteignez 20 filleuls actifs pour débloquer votre premier salaire.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Paliers de Salaire</h3>
              {salaryMilestones.map((milestone, idx) => {
                const isUnlocked = activeSubsCount >= milestone.requirement;
                const progress = Math.min(100, Math.max(0, (activeSubsCount / milestone.requirement) * 100));

                return (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-emerald-50/70 border-emerald-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5" />}
                        <span className={`font-bold text-sm ${isUnlocked ? 'text-emerald-700' : 'text-gray-700'}`}>{milestone.requirement} personnes</span>
                      </div>
                      <span className={`font-black ${isUnlocked ? 'text-emerald-600' : 'text-gray-900'} bg-white px-2 py-1 rounded-md border ${isUnlocked ? 'border-emerald-100' : 'border-gray-200'} shadow-sm text-xs`}>{formatCurrency(milestone.reward)} / j</span>
                    </div>
                    
                    {!isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                          <span>Progression</span>
                          <span>{activeSubsCount} / {milestone.requirement}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}
                    {isUnlocked && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                         Niveau Atteint
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
