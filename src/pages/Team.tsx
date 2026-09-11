import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, AlertCircle, Share2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';

export function Team() {
  const { user } = useAuthStore();
  const { teamStatsCache, setTeamStatsCache } = useAppStore();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedCircle, setSelectedCircle] = useState<number>(1);
  const [teamStats, setTeamStats] = useState({
    level1: teamStatsCache?.level1 || ([] as any[]),
    level2: teamStatsCache?.level2 || ([] as any[]),
    level3: teamStatsCache?.level3 || ([] as any[]),
    totalBonus: teamStatsCache?.totalBonus || 0
  });
  const [isLoading, setIsLoading] = useState(!teamStatsCache);

  let baseLink = window.location.origin;
  if (baseLink.includes('ais-dev-')) {
    baseLink = baseLink.replace('ais-dev-', 'ais-pre-');
  }
  const referralLink = `${baseLink}/register?ref=${user?.referral_code || ''}`;

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
        window.prompt("Copiez votre lien de parrainage ci-dessous :", referralLink);
        setCopyStatus('success'); 
      }
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const totalMembers = teamStats.level1.length + teamStats.level2.length + teamStats.level3.length;

  const currentMembers = selectedCircle === 1 
    ? teamStats.level1 
    : selectedCircle === 2 
      ? teamStats.level2 
      : teamStats.level3;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-5 pt-6 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>

      <header className="flex justify-between items-center pb-4 border-b border-black/5 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Équipe</h1>
          <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider mt-0.5">Parrainage & Réseau</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-10" />
      </header>

      {/* Petite carte en haut : Lien, Total gagné parrainage, Total invité */}
      <div className="mt-4 bg-white border border-black/5 rounded-2xl p-4 shadow-sm relative z-10">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-500/15">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total gagné</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">{formatCurrency(teamStats.totalBonus)}</p>
          </div>
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-500/15">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total invité</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{totalMembers} membres</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Votre lien de parrainage</p>
          <div className="flex items-center gap-2">
            <input 
              readOnly
              type="text"
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-mono focus:outline-none select-all"
            />
            <button 
              onClick={copyCode}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm active:scale-95"
            >
              {copyStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copier
                </>
              )}
            </button>
          </div>
        </div>

        {copyStatus === 'error' && (
          <div className="mt-2 bg-red-50 text-red-600 rounded-lg p-2 text-xs flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Sélectionnez et copiez le lien manuellement.
          </div>
        )}
      </div>

      {/* Cercles alignés horizontalement */}
      <div className="mt-6 relative z-10">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
          Cercles de parrainage
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {/* Cercle 1 */}
          <button
            onClick={() => setSelectedCircle(1)}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedCircle === 1 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-white text-gray-900 border-black/5 hover:border-emerald-500/30'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mb-1 ${
              selectedCircle === 1 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-500/20'
            }`}>
              1
            </div>
            <p className="text-[11px] font-black leading-tight">Cercle 1</p>
            <p className={`text-[10px] font-extrabold mt-0.5 ${selectedCircle === 1 ? 'text-emerald-100' : 'text-emerald-600'}`}>
              10%
            </p>
            <span className={`text-[9px] font-medium mt-0.5 ${selectedCircle === 1 ? 'text-white/80' : 'text-gray-400'}`}>
              {teamStats.level1.length} invité{teamStats.level1.length > 1 ? 's' : ''}
            </span>
          </button>

          {/* Cercle 2 */}
          <button
            onClick={() => setSelectedCircle(2)}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedCircle === 2 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-white text-gray-900 border-black/5 hover:border-emerald-500/30'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mb-1 ${
              selectedCircle === 2 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-500/20'
            }`}>
              2
            </div>
            <p className="text-[11px] font-black leading-tight">Cercle 2</p>
            <p className={`text-[10px] font-extrabold mt-0.5 ${selectedCircle === 2 ? 'text-emerald-100' : 'text-emerald-600'}`}>
              3%
            </p>
            <span className={`text-[9px] font-medium mt-0.5 ${selectedCircle === 2 ? 'text-white/80' : 'text-gray-400'}`}>
              {teamStats.level2.length} invité{teamStats.level2.length > 1 ? 's' : ''}
            </span>
          </button>

          {/* Cercle 3 */}
          <button
            onClick={() => setSelectedCircle(3)}
            className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center text-center transition-all border ${
              selectedCircle === 3 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                : 'bg-white text-gray-900 border-black/5 hover:border-emerald-500/30'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mb-1 ${
              selectedCircle === 3 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-500/20'
            }`}>
              3
            </div>
            <p className="text-[11px] font-black leading-tight">Cercle 3</p>
            <p className={`text-[10px] font-extrabold mt-0.5 ${selectedCircle === 3 ? 'text-emerald-100' : 'text-emerald-600'}`}>
              2%
            </p>
            <span className={`text-[9px] font-medium mt-0.5 ${selectedCircle === 3 ? 'text-white/80' : 'text-gray-400'}`}>
              {teamStats.level3.length} invité{teamStats.level3.length > 1 ? 's' : ''}
            </span>
          </button>
        </div>

        {/* Liste des membres du cercle sélectionné */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-gray-700">
              Membres du Cercle {selectedCircle} ({currentMembers.length})
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Commission : {selectedCircle === 1 ? '10%' : selectedCircle === 2 ? '3%' : '2%'}
            </span>
          </div>

          {isLoading ? (
            <p className="text-xs text-emerald-600 text-center py-8 font-bold animate-pulse">
              Chargement des données...
            </p>
          ) : currentMembers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-black/5">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Aucun membre dans ce cercle
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Partagez votre lien pour développer ce niveau.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentMembers.map((member) => {
                const totalInvested = member.investments?.reduce((sum: number, inv: any) => sum + (Number(inv.plan_amount) || 0), 0) || 0;
                return (
                  <div key={member.id} className="p-3.5 bg-white rounded-xl border border-black/5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">
                        {member.first_name || 'Membre'} {member.last_name || ''}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Inscrit le {format(new Date(member.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono font-bold text-gray-700">
                        {member.phone}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                        {totalInvested > 0 ? formatCurrency(totalInvested) : '0 FCFA'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
