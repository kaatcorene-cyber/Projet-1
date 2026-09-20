import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Copy, Users, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Award, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';
import { Link } from 'react-router-dom';

type TeamStatsCache = {
  level1: any[];
  level2: any[];
  level3: any[];
  totalBonus: number;
};

const getTeamStatsCache = (): TeamStatsCache | null => {
  try {
    const raw = localStorage.getItem('agritrans_team_stats');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const setTeamStatsCache = (data: TeamStatsCache) => {
  try {
    localStorage.setItem('agritrans_team_stats', JSON.stringify(data));
  } catch (e) {}
};

export function Team() {
  const { user } = useAuthStore();
  const [selectedCircle, setSelectedCircle] = useState<1 | 2 | 3>(1);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const [teamStats, setTeamStats] = useState<TeamStatsCache>(() => {
    return getTeamStatsCache() || { level1: [], level2: [], level3: [], totalBonus: 0 };
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ''}`;

  useEffect(() => {
    fetchTeamData();
  }, [user]);

  const fetchTeamData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const userRefCodes = [user.referral_code, user.id].filter(Boolean);
      const { data: level1Users } = await supabase
        .from('users')
        .select('id, phone, referral_code, created_at, investments(id, plan_amount, status)')
        .in('referred_by', userRefCodes);

      const l1 = level1Users || [];
      let l2: any[] = [];
      let l3: any[] = [];

      if (l1.length > 0) {
        const l1RefCodes = Array.from(new Set(l1.flatMap(u => [u.referral_code, u.id]).filter(Boolean)));
        const { data: level2Users } = await supabase
          .from('users')
          .select('id, phone, referral_code, created_at, investments(id, plan_amount, status)')
          .in('referred_by', l1RefCodes);
        
        l2 = level2Users || [];

        if (l2.length > 0) {
          const l2RefCodes = Array.from(new Set(l2.flatMap(u => [u.referral_code, u.id]).filter(Boolean)));
          const { data: level3Users } = await supabase
            .from('users')
            .select('id, phone, referral_code, created_at, investments(id, plan_amount, status)')
            .in('referred_by', l2RefCodes);
          
          l3 = level3Users || [];
        }
      }

      const { data: bonusTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .in('type', ['referral_bonus', 'commission', 'bonus', 'parrainage']);

      let totalBonus = 0;
      if (bonusTxs) {
        totalBonus = bonusTxs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
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
        setCopyStatus('error');
      }
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const totalMembers = teamStats.level1.length + teamStats.level2.length + teamStats.level3.length;
  const currentMembers = selectedCircle === 1 ? teamStats.level1 : selectedCircle === 2 ? teamStats.level2 : teamStats.level3;

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">Réseau d'Affiliation</h1>
          <p className="text-emerald-700 text-[10px] uppercase font-black tracking-wider">Programme Partenaires 3 Niveaux</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-xl mx-auto space-y-3 px-3 sm:px-0">
        
        {/* Compact Stats Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm flex items-center justify-between divide-x divide-slate-200">
          <div className="pr-3 flex-1">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gains Parrainage
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {formatCurrency(teamStats.totalBonus)}
            </p>
          </div>

          <div className="pl-3 flex-1 text-right">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-600" />
              Membres Référés
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-700 tracking-tight mt-0.5">
              {totalMembers}
            </p>
          </div>
        </div>

        {/* Link Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
              Votre Lien d’Invitation
            </label>
            <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Code : {user?.referral_code || '---'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              readOnly
              type="text"
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none select-all focus:border-emerald-600 transition-colors"
            />
            <button 
              onClick={copyCode}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm cursor-pointer"
            >
              {copyStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {copyStatus === 'error' && (
            <div className="p-2 bg-red-50 text-red-900 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>Sélectionnez et copiez le lien manuellement.</span>
            </div>
          )}
        </div>

        {/* Compact Level Selectors */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
              Niveaux de Commissions
            </h2>
            <span className="text-[11px] font-bold text-slate-500">Total : {totalMembers} affilié{totalMembers > 1 ? 's' : ''}</span>
          </div>

          {/* Reduced & Compact Niveaux Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {/* Niveau 1 */}
            <button
              onClick={() => setSelectedCircle(1)}
              className={`py-2 px-2 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                selectedCircle === 1 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N1 (20%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 1 ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {teamStats.level1.length} membre{teamStats.level1.length > 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {/* Niveau 2 */}
            <button
              onClick={() => setSelectedCircle(2)}
              className={`py-2 px-2 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                selectedCircle === 2 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N2 (2%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 2 ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {teamStats.level2.length} membre{teamStats.level2.length > 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {/* Niveau 3 */}
            <button
              onClick={() => setSelectedCircle(3)}
              className={`py-2 px-2 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                selectedCircle === 3 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N3 (1%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 3 ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {teamStats.level3.length} membre{teamStats.level3.length > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          </div>

          {/* Members List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">
                Partenaires Niveau {selectedCircle} ({currentMembers.length})
              </span>
              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Taux : {selectedCircle === 1 ? '20%' : selectedCircle === 2 ? '2%' : '1%'}
              </span>
            </div>

            {isLoading ? (
              <p className="text-xs text-emerald-700 text-center py-8 font-bold animate-pulse">
                Chargement du réseau...
              </p>
            ) : currentMembers.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-900 font-bold uppercase tracking-wider">
                  Aucun affilié pour le moment dans ce niveau
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Partagez votre lien d’invitation pour percevoir vos commissions sur les véhicules activés.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentMembers.map((member) => {
                  const totalInvested = member.investments?.reduce((sum: number, inv: any) => sum + (Number(inv.plan_amount) || 0), 0) || 0;
                  return (
                    <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xs font-mono">
                            {member.phone}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            Rejoint le {format(new Date(member.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-700">
                          {totalInvested > 0 ? formatCurrency(totalInvested) : '0 FCFA'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                          Volume flotte
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
    </div>
  );
}
