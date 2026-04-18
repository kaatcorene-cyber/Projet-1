import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, TrendingUp, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Team() {
  const { user } = useAuthStore();
  const { teamStatsCache, setTeamStatsCache } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [teamStats, setTeamStats] = useState({
    level1: teamStatsCache?.level1 || ([] as any[]),
    level2: teamStatsCache?.level2 || ([] as any[]),
    level3: teamStatsCache?.level3 || ([] as any[]),
    totalBonus: teamStatsCache?.totalBonus || 0
  });
  
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(!teamStatsCache);

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

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
      const { data: l1Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at').eq('referred_by', user.referral_code).order('created_at', { ascending: false });
      const l1 = l1Data || [];
      const l1Codes = l1.map(u => u.referral_code).filter(Boolean);

      // 3. Fetch Level 2
      let l2: any[] = [];
      let l2Codes: string[] = [];
      if (l1Codes.length > 0) {
        const { data: l2Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at').in('referred_by', l1Codes).order('created_at', { ascending: false });
        l2 = l2Data || [];
        l2Codes = l2.map(u => u.referral_code).filter(Boolean);
      }

      // 4. Fetch Level 3
      let l3: any[] = [];
      if (l2Codes.length > 0) {
        const { data: l3Data } = await supabase.from('users').select('id, first_name, last_name, phone, referral_code, created_at').in('referred_by', l2Codes).order('created_at', { ascending: false });
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

  const copyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez Petrolimex',
          text: 'Inscrivez-vous sur Petrolimex avec mon lien de parrainage et commençons à gagner !',
          url: referralLink,
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      copyCode();
    }
  };

  const totalMembers = teamStats.level1.length + teamStats.level2.length + teamStats.level3.length;

  const renderMemberList = (members: any[]) => {
    if (members.length === 0) {
      return <p className="text-sm text-gray-500 py-2 text-center bg-gray-50 rounded-xl mt-2">Aucun membre à ce niveau.</p>;
    }
    return (
      <div className="mt-3 space-y-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {member.first_name} {member.last_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Inscrit le {format(new Date(member.created_at), 'dd MMM yyyy', { locale: fr })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                {member.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1**$3$4')}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 pt-20 pb-24 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Équipe</h1>
          <p className="text-gray-500 text-sm mt-1">Gagnez jusqu'à 29% de commissions</p>
        </div>
        <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <p className="text-gray-500 text-sm font-medium mb-2 relative z-10">Votre lien de parrainage unique</p>
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">
            {referralLink}
          </div>
          <button 
            onClick={copyCode}
            className="w-12 h-12 shrink-0 bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center text-white transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={shareLink}
            className="w-12 h-12 shrink-0 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-sm cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">Gains Parrainage</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(teamStats.totalBonus)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">Taille Équipe</p>
            <p className="text-lg font-bold text-gray-900">{totalMembers}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 animate-slide-up">
        <h3 className="text-lg font-bold text-gray-900">Membres de l'équipe</h3>
        
        {/* LEVEL 1 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 1 ? null : 1)}
            className="w-full p-4 flex items-center justify-between bg-white cursor-pointer"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">Niveau 1</p>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">25%</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{teamStats.level1.length} membres</p>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 1 && (
            <div className="px-4 pb-4 border-t border-gray-50">
              {isLoading ? <p className="text-sm text-gray-400 text-center py-4">Chargement...</p> : renderMemberList(teamStats.level1)}
            </div>
          )}
        </div>

        {/* LEVEL 2 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 2 ? null : 2)}
            className="w-full p-4 flex items-center justify-between bg-white cursor-pointer"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">Niveau 2</p>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">3%</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{teamStats.level2.length} membres</p>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 2 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 2 && (
            <div className="px-4 pb-4 border-t border-gray-50">
               {isLoading ? <p className="text-sm text-gray-400 text-center py-4">Chargement...</p> : renderMemberList(teamStats.level2)}
            </div>
          )}
        </div>

        {/* LEVEL 3 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all">
          <button 
            onClick={() => setExpandedLevel(expandedLevel === 3 ? null : 3)}
            className="w-full p-4 flex items-center justify-between bg-white cursor-pointer"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">Niveau 3</p>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">1%</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{teamStats.level3.length} membres</p>
            </div>
            <div className="text-gray-400">
              {expandedLevel === 3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedLevel === 3 && (
            <div className="px-4 pb-4 border-t border-gray-50">
               {isLoading ? <p className="text-sm text-gray-400 text-center py-4">Chargement...</p> : renderMemberList(teamStats.level3)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
