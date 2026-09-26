import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, User, generatePhoneCandidates } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Copy, Users, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Award, UserCheck, RefreshCw, Share2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';
import { Link } from 'react-router-dom';
import { 
  getLocalUsers, 
  getLocalInvestments, 
  getLocalTransactions, 
  saveLocalUsersBatch, 
  saveLocalInvestmentsBatch, 
  saveLocalTransactionsBatch 
} from '../lib/dataStore';

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

    const cleanStr = (s?: string | null) => (s || '').trim().toUpperCase();
    const normalizeCode = (s?: string | null) => (s || '').trim().toUpperCase().replace(/[\s\-\(\)\.]/g, '');

    const attachInvestments = (u: any): TeamMember => {
      const candidates = new Set<string>([
        cleanStr(u.id),
        cleanStr(u.phone),
        ...generatePhoneCandidates(u.phone || '').map(c => cleanStr(c))
      ]);

      const matchedInvs: Array<{ id: string; plan_amount: number; status?: string }> = [];
      localInvs.forEach(inv => {
        if (inv.user_id && candidates.has(cleanStr(inv.user_id))) {
          matchedInvs.push({ id: inv.id, plan_amount: Number(inv.plan_amount || 0), status: inv.status });
        }
      });

      return {
        id: u.id,
        phone: u.phone,
        referral_code: u.referral_code,
        referred_by: u.referred_by,
        created_at: u.created_at || new Date().toISOString(),
        investments: matchedInvs
      };
    };

    const userCodes = new Set<string>();
    if (user.referral_code) {
      userCodes.add(cleanStr(user.referral_code));
      userCodes.add(normalizeCode(user.referral_code));
    }
    if (user.id) {
      userCodes.add(cleanStr(user.id));
      userCodes.add(normalizeCode(user.id));
    }
    if (user.phone) {
      userCodes.add(cleanStr(user.phone));
      userCodes.add(normalizeCode(user.phone));
      generatePhoneCandidates(user.phone).forEach(c => {
        userCodes.add(cleanStr(c));
        userCodes.add(normalizeCode(c));
      });
    }

    const matchesCodes = (referredBy: string | null | undefined, codeSet: Set<string>): boolean => {
      if (!referredBy) return false;
      const cleanRef = cleanStr(referredBy);
      const normRef = normalizeCode(referredBy);
      if (codeSet.has(cleanRef) || codeSet.has(normRef)) return true;
      const refDigits = cleanRef.replace(/\D/g, '');
      if (refDigits.length >= 8) {
        for (const code of codeSet) {
          if (code.replace(/\D/g, '') === refDigits) return true;
        }
      }
      return false;
    };

    // Niveau 1
    const l1Raw = localUsers.filter(u => u.id !== user.id && matchesCodes(u.referred_by, userCodes));
    const l1 = l1Raw.map(attachInvestments);

    // Niveau 2
    const l1Codes = new Set<string>();
    l1.forEach(u => {
      if (u.referral_code) {
        l1Codes.add(cleanStr(u.referral_code));
        l1Codes.add(normalizeCode(u.referral_code));
      }
      if (u.id) {
        l1Codes.add(cleanStr(u.id));
        l1Codes.add(normalizeCode(u.id));
      }
      if (u.phone) {
        l1Codes.add(cleanStr(u.phone));
        l1Codes.add(normalizeCode(u.phone));
        generatePhoneCandidates(u.phone).forEach(c => {
          l1Codes.add(cleanStr(c));
          l1Codes.add(normalizeCode(c));
        });
      }
    });
    const l2Raw = localUsers.filter(u => u.id !== user.id && !l1Raw.some(l1u => l1u.id === u.id) && matchesCodes(u.referred_by, l1Codes));
    const l2 = l2Raw.map(attachInvestments);

    // Niveau 3
    const l2Codes = new Set<string>();
    l2.forEach(u => {
      if (u.referral_code) {
        l2Codes.add(cleanStr(u.referral_code));
        l2Codes.add(normalizeCode(u.referral_code));
      }
      if (u.id) {
        l2Codes.add(cleanStr(u.id));
        l2Codes.add(normalizeCode(u.id));
      }
      if (u.phone) {
        l2Codes.add(cleanStr(u.phone));
        l2Codes.add(normalizeCode(u.phone));
        generatePhoneCandidates(u.phone).forEach(c => {
          l2Codes.add(cleanStr(c));
          l2Codes.add(normalizeCode(c));
        });
      }
    });
    const l3Raw = localUsers.filter(u => u.id !== user.id && !l1Raw.some(l1u => l1u.id === u.id) && !l2Raw.some(l2u => l2u.id === u.id) && matchesCodes(u.referred_by, l2Codes));
    const l3 = l3Raw.map(attachInvestments);

    // Calcul automatique des commissions : N1 (20%), N2 (2%), N3 (1%)
    const l1InvTotal = l1.reduce((sum, u) => sum + (u.investments || []).reduce((s, i) => s + (Number(i.plan_amount) || 0), 0), 0);
    const l2InvTotal = l2.reduce((sum, u) => sum + (u.investments || []).reduce((s, i) => s + (Number(i.plan_amount) || 0), 0), 0);
    const l3InvTotal = l3.reduce((sum, u) => sum + (u.investments || []).reduce((s, i) => s + (Number(i.plan_amount) || 0), 0), 0);
    const calculatedCommission = Math.round((l1InvTotal * 0.20) + (l2InvTotal * 0.02) + (l3InvTotal * 0.01));

    // Total commissions enregistrées pour l'utilisateur connecté
    const recordedBonus = localTxs
      .filter(tx => tx.user_id === user.id && ['referral_bonus', 'commission', 'bonus', 'parrainage'].includes(tx.type))
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const totalBonus = Math.max(calculatedCommission, recordedBonus);

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

    try {
      // 1. Calcul local ultra-rapide en premier plan (0ms)
      const localData = computeLocalTeam(user);
      setTeamStats(localData);

      // 2. Synchronisation instantanée avec l'API serveur interne (<5ms)
      try {
        const [serverUsers, serverInvs, serverTxs] = await Promise.all([
          fetch('/api/users').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/investments').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/transactions?userId=${user.id}`).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          saveLocalUsersBatch(serverUsers);
        }
        if (Array.isArray(serverInvs) && serverInvs.length > 0) {
          saveLocalInvestmentsBatch(serverInvs);
        }
        if (Array.isArray(serverTxs) && serverTxs.length > 0) {
          saveLocalTransactionsBatch(serverTxs);
        }

        const freshData = computeLocalTeam(user);
        setTeamStats(freshData);
        setTeamStatsCache(user.id, freshData);
      } catch (e) {}

      // 3. Tentative d'arrière-plan Supabase avec timeout très court (800ms max)
      const fetchRemote = async (): Promise<void> => {
        const userRefCodes = [user.referral_code, user.id].filter(Boolean);

        const [bonusRes, l1Res] = await Promise.all([
          supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .in('type', ['referral_bonus', 'commission', 'bonus', 'parrainage']),
          supabase
            .from('users')
            .select('*')
            .in('referred_by', userRefCodes)
        ]);

        if (l1Res.data && Array.isArray(l1Res.data) && l1Res.data.length > 0) {
          saveLocalUsersBatch(l1Res.data);
        }
        const updated = computeLocalTeam(user);
        setTeamStats(updated);
        setTeamStatsCache(user.id, updated);
      };

      await Promise.race([
        fetchRemote(),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 800))
      ]);
    } catch (e) {
      console.warn('Sync partiel:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeamData(true);

    // Actualisation discrète toutes les 15s
    const interval = setInterval(() => {
      fetchTeamData(true);
    }, 15000);

    const onUpdate = () => fetchTeamData(true);
    window.addEventListener('agritrans_tx_updated', onUpdate);
    window.addEventListener('agritrans_inv_updated', onUpdate);
    window.addEventListener('agritrans_user_updated', onUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('agritrans_tx_updated', onUpdate);
      window.removeEventListener('agritrans_inv_updated', onUpdate);
      window.removeEventListener('agritrans_user_updated', onUpdate);
    };
  }, [fetchTeamData]);

  const [copyCodeOnlyStatus, setCopyCodeOnlyStatus] = useState<'idle' | 'success'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'success'>('idle');

  const shareText = `Rejoignez ORLEN Côte d'Ivoire, le réseau leader de stations-service et distribution d'énergie ! Utilisez mon code d'invitation : ${user?.referral_code || user?.phone || ''}\nLien d'inscription : ${referralLink}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ORLEN CI - Invitation',
          text: shareText,
          url: referralLink,
        });
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2500);
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    handleWhatsAppShare();
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const copyOnlyCode = async () => {
    const code = user?.referral_code || user?.phone;
    if (!code) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopyCodeOnlyStatus('success');
      setTimeout(() => setCopyCodeOnlyStatus('idle'), 2500);
    } catch (e) {}
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
          <p className="text-red-700 text-[10px] uppercase font-black tracking-wider">Programme Partenaires 3 Niveaux</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTeamData(false)}
            disabled={isSyncing}
            title="Actualiser"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
          </button>
          <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
        </div>
      </header>

      <div className="pt-3 max-w-xl mx-auto space-y-3 px-3 sm:px-0">
        
        {/* Compact Stats Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm flex items-center justify-between divide-x divide-slate-200">
          <div className="pr-3 flex-1">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-600" />
              Gains Parrainage
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {formatCurrency(teamStats.totalBonus)}
            </p>
          </div>

          <div className="pl-3 flex-1 text-right">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Users className="w-3 h-3 text-red-600" />
              Membres Référés
            </span>
            <p className="text-base sm:text-lg font-black text-red-700 tracking-tight mt-0.5">
              {totalMembers}
            </p>
          </div>
        </div>

        {/* Link & Share Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
              Votre Lien d’Invitation
            </label>
            <button 
              onClick={copyOnlyCode}
              title="Copier uniquement le code"
              className="text-[11px] font-mono font-black text-red-800 bg-red-50 hover:bg-red-100 active:scale-95 px-2.5 py-1 rounded-lg border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Code : {user?.referral_code || user?.phone || '---'}</span>
              {copyCodeOnlyStatus === 'success' ? (
                <CheckCircle2 className="w-3 h-3 text-red-600" />
              ) : (
                <Copy className="w-3 h-3 text-red-600" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input 
              readOnly
              type="text"
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none select-all focus:border-red-600 transition-colors"
            />
            <button 
              onClick={copyCode}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm cursor-pointer"
            >
              {copyStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-200" />
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

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-red-600" />
              <span>{shareStatus === 'success' ? 'Partagé !' : 'Partager le lien'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 text-red-800 text-xs font-black transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Sur WhatsApp</span>
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
                  ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N1 (20%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 1 ? 'text-red-100' : 'text-slate-500'}`}>
                  {teamStats.level1.length} membre{teamStats.level1.length > 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {/* Niveau 2 */}
            <button
              onClick={() => setSelectedCircle(2)}
              className={`py-2 px-2 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                selectedCircle === 2 
                  ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N2 (2%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 2 ? 'text-red-100' : 'text-slate-500'}`}>
                  {teamStats.level2.length} membre{teamStats.level2.length > 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {/* Niveau 3 */}
            <button
              onClick={() => setSelectedCircle(3)}
              className={`py-2 px-2 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                selectedCircle === 3 
                  ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-left">
                <p className="text-[11px] font-black leading-tight">N3 (1%)</p>
                <p className={`text-[10px] font-semibold ${selectedCircle === 3 ? 'text-red-100' : 'text-slate-500'}`}>
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
              <span className="text-[11px] font-black text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                Taux : {selectedCircle === 1 ? '20%' : selectedCircle === 2 ? '2%' : '1%'}
              </span>
            </div>

            {isSyncing && currentMembers.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto animate-spin">
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
                        <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold text-xs">
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
                        <p className="text-xs font-black text-red-700">
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
