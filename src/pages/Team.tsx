import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, TrendingUp, ChevronDown, ChevronUp, MessageCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
      return <p className="text-sm text-gray-500 py-2 text-center bg-gray-50 rounded-xl mt-2 border border-gray-100">Aucun membre à ce niveau.</p>;
    }
    return (
      <div className="mt-3 space-y-2">
        {members.map(member => {
          const totalInvested = member.investments?.reduce((sum: number, inv: any) => sum + (Number(inv.plan_amount) || 0), 0) || 0;
          return (
          <div key={member.id} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Inscrit le {format(new Date(member.created_at), 'dd MMM yyyy', { locale: fr })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                  {member.phone}
                </p>
              </div>
            </div>
            {totalInvested > 0 ? (
              <div className="flex items-center justify-between bg-red-50 rounded-lg p-2 border border-red-100/50">
                 <span className="text-xs font-medium text-red-900">Investissement total:</span>
                 <span className="text-sm font-bold text-red-700">{formatCurrency(totalInvested)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                 <span className="text-xs font-medium text-gray-500">Investissement:</span>
                 <span className="text-xs font-semibold text-gray-400">Aucun</span>
              </div>
            )}
          </div>
        )})}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 pt-16 pb-24 font-sans">
      <header className="flex justify-between items-end pb-2 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mon Équipe</h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Gagnez jusqu'à 22%</p>
        </div>
        <img src="https://i.imgur.com/awFyFRj.png" alt="QUALCOMM" className="h-6 object-contain" referrerPolicy="no-referrer" />
      </header>

      <div className="bg-white border text-center border-gray-200 rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 z-10 relative">Gains d'équipe</p>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 z-10 relative">{formatCurrency(teamStats.totalBonus)}</h2>
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200 mb-6 z-10 relative gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          {totalMembers} Membres au total
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <input 
            readOnly
            type="text"
            value={referralLink}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-xs font-mono tracking-tight focus:outline-none focus:border-red-500 transition-colors text-center"
          />
          <button 
            onClick={copyCode}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 text-white font-semibold transition-colors shadow-sm cursor-pointer"
          >
            {copyStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-red-200" /> Lien copié !
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copier mon lien
              </>
            )}
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
      </div>

      <div className="space-y-4 animate-fade-in">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Détails par niveau</h3>
        
        {/* LEVEL 1 */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 1 ? null : 1)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer"
          >
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-black">1</div>
              <div>
                <p className="font-bold text-gray-900">Niveau 1 <span className="text-xs font-semibold text-red-500 ml-1">(20%)</span></p>
                <p className="text-gray-500 text-xs mt-0.5">{teamStats.level1.length} membres</p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 1 && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
              {isLoading ? <p className="text-xs text-gray-400 text-center py-4 font-medium uppercase tracking-wider">Chargement...</p> : renderMemberList(teamStats.level1)}
            </div>
          )}
        </div>

        {/* LEVEL 2 */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 2 ? null : 2)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer"
          >
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 font-black">2</div>
              <div>
                <p className="font-bold text-gray-900">Niveau 2 <span className="text-xs font-semibold text-red-500 ml-1">(1%)</span></p>
                <p className="text-gray-500 text-xs mt-0.5">{teamStats.level2.length} membres</p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 2 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 2 && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
               {isLoading ? <p className="text-xs text-gray-400 text-center py-4 font-medium uppercase tracking-wider">Chargement...</p> : renderMemberList(teamStats.level2)}
            </div>
          )}
        </div>

        {/* LEVEL 3 */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 3 ? null : 3)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer"
          >
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 font-black">3</div>
              <div>
                <p className="font-bold text-gray-900">Niveau 3 <span className="text-xs font-semibold text-red-500 ml-1">(1%)</span></p>
                <p className="text-gray-500 text-xs mt-0.5">{teamStats.level3.length} membres</p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 3 && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
               {isLoading ? <p className="text-xs text-gray-400 text-center py-4 font-medium uppercase tracking-wider">Chargement...</p> : renderMemberList(teamStats.level3)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
