import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, ChevronDown, ChevronUp, AlertCircle, Sun, Network } from 'lucide-react';
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
      return <p className="text-sm text-gray-500 py-3 text-center bg-[#0a0a0a] rounded-xl mt-2 border border-white/5 uppercase tracking-widest font-bold">Aucune cellule active.</p>;
    }
    return (
      <div className="mt-4 space-y-3">
        {members.map(member => {
          const totalInvested = member.investments?.reduce((sum: number, inv: any) => sum + (Number(inv.plan_amount) || 0), 0) || 0;
          return (
          <div key={member.id} className="flex flex-col gap-3 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-inner hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-white text-sm tracking-tight drop-shadow-sm">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold text-shadow-sm">Connecté le {format(new Date(member.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 tracking-wider">
                  {member.phone}
                </p>
              </div>
            </div>
            {totalInvested > 0 ? (
              <div className="flex items-center justify-between bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 shadow-inner">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Puissance déployée</span>
                 <span className="text-sm font-black text-amber-500 drop-shadow-md">{formatCurrency(totalInvested)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#111] rounded-xl p-3 border border-white/5">
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Puissance déployée</span>
                 <span className="text-sm font-black text-gray-500">0 FCFA</span>
              </div>
            )}
          </div>
        )})}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-5 pt-16 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <header className="flex justify-between items-end pb-6 border-b border-white/5 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Réseau</h1>
          <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">Expansion du Parc</p>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
      </header>

      <div className="mt-6 bg-[#111] border text-center border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden z-10 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500"></div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 z-10 relative drop-shadow-sm">Énergie Récupérée (Parrainage)</p>
        <h2 className="text-5xl font-black text-white tracking-tighter mb-5 z-10 relative ">{formatCurrency(teamStats.totalBonus)}</h2>
        
        <div className="inline-flex items-center justify-center px-4 py-2 bg-[#0a0a0a] text-amber-500 rounded-xl text-xs font-black border border-white/5 mb-8 z-10 relative gap-2 shadow-inner uppercase tracking-wider">
          <Network className="w-4 h-4 text-white" />
          Nœuds Actifs : <span className="text-white text-sm">{totalMembers}</span>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <input 
            readOnly
            type="text"
            value={referralLink}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-4 text-center text-amber-500 text-xs font-mono font-bold tracking-tight focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner"
          />
          <button 
            onClick={copyCode}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center justify-center gap-2 text-black font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
          >
            {copyStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> Lien synchronisé !
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Partager le faisceau
              </>
            )}
          </button>
        </div>

        {copyStatus === 'error' && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-left animate-in fade-in zoom-in duration-200">
            <p className="text-red-400 text-[10px] font-bold flex items-start gap-2 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
              Sélectionnez et copiez manuellement
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 animate-fade-in mt-8 relative z-10">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 drop-shadow-sm">Topologie du Réseau</h3>
        
        {/* LEVEL 1 */}
        <div className="bg-[#111] border border-white/5 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 1 ? null : 1)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="text-left flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 font-black text-xl shadow-inner drop-shadow-md">1</div>
              <div>
                <p className="font-black text-white text-lg">Cercle Primaire <span className="text-[10px] font-black text-amber-500 ml-2 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">20%</span></p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{teamStats.level1.length} nœuds</p>
              </div>
            </div>
            <div className="text-gray-500">
              {expandedLevel === 1 ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedLevel === 1 && (
            <div className="px-5 pb-5 border-t border-white/5 bg-[#111]">
              {isLoading ? <p className="text-[10px] text-amber-500 text-center py-6 font-black uppercase tracking-widest animate-pulse drop-shadow-md">Analyse en cours...</p> : renderMemberList(teamStats.level1)}
            </div>
          )}
        </div>

        {/* LEVEL 2 */}
        <div className="bg-[#111] border border-white/5 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 2 ? null : 2)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="text-left flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-500/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 font-black text-xl shadow-inner">2</div>
              <div>
                <p className="font-black text-white text-lg">Cercle Secondaire <span className="text-[10px] font-black text-amber-500 ml-2 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">2%</span></p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{teamStats.level2.length} nœuds</p>
              </div>
            </div>
            <div className="text-gray-500">
              {expandedLevel === 2 ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedLevel === 2 && (
            <div className="px-5 pb-5 border-t border-white/5 bg-[#111]">
               {isLoading ? <p className="text-[10px] text-amber-500 text-center py-6 font-black uppercase tracking-widest animate-pulse drop-shadow-md">Analyse en cours...</p> : renderMemberList(teamStats.level2)}
            </div>
          )}
        </div>

        {/* LEVEL 3 */}
        <div className="bg-[#111] border border-white/5 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 3 ? null : 3)}
            className="w-full p-4 flex items-center justify-between bg-transparent cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="text-left flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-500/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 font-black text-xl shadow-inner">3</div>
              <div>
                <p className="font-black text-white text-lg">Cercle Tertiaire <span className="text-[10px] font-black text-amber-500 ml-2 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">1%</span></p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{teamStats.level3.length} nœuds</p>
              </div>
            </div>
            <div className="text-gray-500">
              {expandedLevel === 3 ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedLevel === 3 && (
            <div className="px-5 pb-5 border-t border-white/5 bg-[#111]">
               {isLoading ? <p className="text-[10px] text-amber-500 text-center py-6 font-black uppercase tracking-widest animate-pulse drop-shadow-md">Analyse en cours...</p> : renderMemberList(teamStats.level3)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
