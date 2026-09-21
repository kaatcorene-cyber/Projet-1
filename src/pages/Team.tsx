import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, User } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Copy, Users, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Award, UserCheck, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';
import { Link } from 'react-router-dom';
import { getLocalUsers, getLocalInvestments, getLocalTransactions } from '../lib/dataStore';

type TeamMember = {
  id: string;
  phone: string;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  investments?: Array<{ id: string; plan_amount: number; status?: string }>;
};

type TeamStatsCache = {
  level1: TeamMember[];
  level2: TeamMember[];
  level3: TeamMember[];
  totalBonus: number;
};

const getTeamStatsCache = (userId?: string): TeamStatsCache | null => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`agritrans_team_stats_${userId}`) || localStorage.getItem('agritrans_team_stats');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const setTeamStatsCache = (userId: string, data: TeamStatsCache) => {
  try {
    localStorage.setItem(`agritrans_team_stats_${userId}`, JSON.stringify(data));
    localStorage.setItem('agritrans_team_stats', JSON.stringify(data));
  } catch (e) {}
};

// Calcul instantané des équipes à partir des données locales
const computeLocalTeam = (user: User): TeamStatsCache => {
  try {
    const localUsers = getLocalUsers();
    const localInvs = getLocalInvestments();
    const localTxs = getLocalTransactions(user.id);

    const invByUserId = new Map<string, Array<{ id: string; plan_amount: number; status?: string }>>();
    localInvs.forEach(inv => {
      const list = invByUserId.get(inv.user_id) || [];
      list.push({ id: inv.id, plan_amount: Number(inv.plan_amount || 0), status: inv.status });
      invByUserId.set(inv.user_id, list);
    });

    const attachInvestments = (u: any): TeamMember => ({
      id: u.id,
      phone: u.phone,
      referral_code: u.referral_code,
      referred_by: u.referred_by,
      created_at: u.created_at || new Date().toISOString(),
      investments: invByUserId.get(u.id) || []
    });

    const userRefCodes = new Set([user.referral_code, user.id].filter(Boolean));

    // Niveau 1
    const l1Raw = localUsers.filter(u => u.referred_by && userRefCodes.has(u.referred_by));
    const l1 = l1Raw.map(attachInvestments);

    // Niveau 2
    const l1Codes = new Set(l1.flatMap(u => [u.referral_code, u.id]).filter(Boolean));
    const l2Raw = localUsers.filter(u => u.referred_by && l1Codes.has(u.referred_by));
    const l2 = l2Raw.map(attachInvestments);

    // Niveau 3
    const l2Codes = new Set(l2.flatMap(u => [u.referral_code, u.id]).filter(Boolean));
    const l3Raw = localUsers.filter(u => u.referred_by && l2Codes.has(u.referred_by));
    const l3 = l3Raw.map(attachInvestments);

    // Total commissions
    const totalBonus = localTxs
      .filter(tx => ['referral_bonus', 'commission', 'bonus', 'parrainage'].includes(tx.type))
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    return { level1: l1, level2: l2, level3: l3, totalBonus };
  } catch (e) {
    return { level1: [], level2: [], level3: [], totalBonus: 0 };
  }
};

export function Team() {
  const { user } = useAuthStore();
  const [selectedCircle, setSelectedCircle] = useState<1 | 2 | 3>(1);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialisation immédiate sans latence
  const [teamStats, setTeamStats] = useState<TeamStatsCache>(() => {
    if (!user) return { level1: [], level2: [], level3: [], totalBonus: 0 };
    const cached = getTeamStatsCache(user.id);
    if (cached && (cached.level1.length > 0 || cached.level2.length > 0 || cached.level3.length > 0 || cached.totalBonus > 0)) {
      return cached;
    }
    return computeLocalTeam(user);
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ''}`;

  const fetchTeamData = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent && teamStats.level1.length === 0 && teamStats.totalBonus === 0) {
      setIsSyncing(true);
    }

    try {
      // 1. Calcul local ultra-rapide en premier plan
      const localData = computeLocalTeam(user);
      if (localData.level1.length > 0 || localData.totalBonus > 0) {
        setTeamStats(prev => ({
          level1: prev.level1.length > 0 ? prev.level1 : localData.level1,
          level2: prev.level2.length > 0 ? prev.level2 : localData.level2,
          level3: prev.level3.length > 0 ? prev.level3 : localData.level3,
          totalBonus: Math.max(prev.totalBonus, localData.totalBonus)
        }));
      }

      // 2. Requête distante ultra-optimisée avec timeout de sécurité (4s max)
      const fetchRemote = async (): Promise<TeamStatsCache | null> => {
        const userRefCodes = [user.referral_code, user.id].filter(Boolean);

        // Lancer la requête de commission et le niveau 1 en PARALLÈLE (sans jointure lourde)
        const [bonusRes, l1Res] = await Promise.all([
          supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .in('type', ['referral_bonus', 'commission', 'bonus', 'parrainage']),
          supabase
            .from('users')
            .select('id, phone, referral_code, created_at')
            .in('referred_by', userRefCodes)
        ]);

        let remoteBonus = 0;
        if (bonusRes.data && Array.isArray(bonusRes.data)) {
          remoteBonus = bonusRes.data.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
        }

        const l1Users = l1Res.data || [];
        let l2Users: any[] = [];
        let l3Users: any[] = [];

        if (l1Users.length > 0) {
          const l1RefCodes = Array.from(new Set(l1Users.flatMap(u => [u.referral_code, u.id]).filter(Boolean)));
          const { data: l2Data } = await supabase
            .from('users')
            .select('id, phone, referral_code, created_at')
            .in('referred_by', l1RefCodes);
          l2Users = l2Data || [];

          if (l2Users.length > 0) {
            const l2RefCodes = Array.from(new Set(l2Users.flatMap(u => [u.referral_code, u.id]).filter(Boolean)));
            const { data: l3Data } = await supabase
              .from('users')
              .select('id, phone, referral_code, created_at')
              .in('referred_by', l2RefCodes);
            l3Users = l3Data || [];
          }
        }

        // Récupérer les investissements de TOUS les membres en UNE seule requête groupée rapide
        const allMemberIds = Array.from(new Set([
          ...l1Users.map(u => u.id),
          ...l2Users.map(u => u.id),
          ...l3Users.map(u => u.id)
        ]));

        const invMap = new Map<string, Array<{ id: string; plan_amount: number; status?: string }>>();
        if (allMemberIds.length > 0) {
          const { data: invData } = await supabase
            .from('investments')
            .select('id, user_id, plan_amount, status')
            .in('user_id', allMemberIds);

          if (invData) {
            invData.forEach(inv => {
              const cur = invMap.get(inv.user_id) || [];
              cur.push({ id: inv.id, plan_amount: Number(inv.plan_amount || 0), status: inv.status });
              invMap.set(inv.user_id, cur);
            });
          }
        }

        // Fusionner avec les investissements locaux
        const localInvs = getLocalInvestments();
        localInvs.forEach(inv => {
          const cur = invMap.get(inv.user_id) || [];
          if (!cur.some(i => i.id === inv.id)) {
            cur.push({ id: inv.id, plan_amount: Number(inv.plan_amount || 0), status: inv.status });
            invMap.set(inv.user_id, cur);
          }
        });

        const formatMember = (u: any): TeamMember => ({
          id: u.id,
          phone: u.phone,
          referral_code: u.referral_code,
          created_at: u.created_at || new Date().toISOString(),
          investments: invMap.get(u.id) || []
        });

        // Fusionner utilisateurs distants et locaux
        const mergeUsers = (remoteList: any[], localList: TeamMember[]): TeamMember[] => {
          const map = new Map<string, TeamMember>();
          remoteList.forEach(u => map.set(u.id, formatMember(u)));
          localList.forEach(u => {
            if (!map.has(u.id)) map.set(u.id, u);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        };

        const finalL1 = mergeUsers(l1Users, localData.level1);
        const finalL2 = mergeUsers(l2Users, localData.level2);
        const finalL3 = mergeUsers(l3Users, localData.level3);
        const finalBonus = Math.max(remoteBonus, localData.totalBonus);

        return {
          level1: finalL1,
          level2: finalL2,
          level3: finalL3,
          totalBonus: finalBonus
        };
      };

      // Timeout de 4 secondes pour que l'interface ne reste jamais bloquée
      const result = await Promise.race([
        fetchRemote(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
      ]);

      if (result) {
        setTeamStats(result);
        setTeamStatsCache(user.id, result);
      }
    } catch (e) {
      console.warn('Sync réseau partiel (mode local actif):', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeamData(false);

    // Actualisation discrète toutes les 25s
    const interval = setInterval(() => {
      fetchTeamData(true);
    }, 25000);

    const onUpdate = () => fetchTeamData(true);
    window.addEventListener('agritrans_tx_updated', onUpdate);
    window.addEventListener('agritrans_inv_updated', onUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('agritrans_tx_updated', onUpdate);
      window.removeEventListener('agritrans_inv_updated', onUpdate);
    };
  }, [fetchTeamData]);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTeamData(false)}
            disabled={isSyncing}
            title="Actualiser"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
        </div>
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

            {isSyncing && currentMembers.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-600 font-bold">
                  Synchronisation du réseau...
                </p>
              </div>
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
