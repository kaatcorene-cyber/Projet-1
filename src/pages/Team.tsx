import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Copy, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Team() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [teamStats, setTeamStats] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    totalBonus: 0
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

  useEffect(() => {
    if (user) {
      fetchTeamStats();
    }
  }, [user]);

  const fetchTeamStats = async () => {
    if (!user) return;

    // Level 1
    const { data: l1 } = await supabase.from('users').select('id, referral_code').eq('referred_by', user.referral_code);
    const l1Count = l1?.length || 0;
    
    // Total bonuses
    const { data: bonuses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'referral_bonus');
      
    const totalBonus = bonuses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    setTeamStats({
      level1: l1Count,
      level2: 0, // Simplified for prototype
      level3: 0, // Simplified for prototype
      totalBonus
    });
  };

  const copyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20 pb-24">
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
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">
            {referralLink}
          </div>
          <button 
            onClick={copyCode}
            className="w-12 h-12 shrink-0 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
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
            <p className="text-lg font-bold text-gray-900">{teamStats.level1 + teamStats.level2 + teamStats.level3}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Niveaux de commission</h3>
        
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">Niveau 1</p>
            <p className="text-gray-500 text-sm">{teamStats.level1} membres</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-500 font-bold text-xl">25%</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">Niveau 2</p>
            <p className="text-gray-500 text-sm">{teamStats.level2} membres</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-500 font-bold text-xl">3%</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">Niveau 3</p>
            <p className="text-gray-500 text-sm">{teamStats.level3} membres</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-500 font-bold text-xl">1%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
