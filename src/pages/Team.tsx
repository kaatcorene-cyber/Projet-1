import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { COUNTRIES, CountryName } from '../constants';
import { Users, User, Copy, CheckCircle2, UserPlus, Gift, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Team() {
  const { user } = useAuthStore();
  const [level1, setLevel1] = useState<any[]>([]);
  const [level2, setLevel2] = useState<any[]>([]);
  const [level3, setLevel3] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [copied, setCopied] = useState(false);
  const [totalCommissions, setTotalCommissions] = useState(0);

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const fetchTeam = async () => {
    if (!user) return;
    try {
      // Niveau 1
      const { data: l1Data } = await supabase
        .from('users')
        .select('*')
        .eq('referred_by', user.referral_code);
            
      const l1 = l1Data || [];
      setLevel1(l1);

      // Niveau 2
      let l2: any[] = [];
      if (l1.length > 0) {
        const l1Codes = l1.map(u => u.referral_code).filter(Boolean);
        if (l1Codes.length > 0) {
          const { data: l2Data } = await supabase
            .from('users')
            .select('*')
            .in('referred_by', l1Codes);
          l2 = l2Data || [];
        }
      }
      setLevel2(l2);

      // Niveau 3
      let l3: any[] = [];
      if (l2.length > 0) {
        const l2Codes = l2.map(u => u.referral_code).filter(Boolean);
        if (l2Codes.length > 0) {
          const { data: l3Data } = await supabase
            .from('users')
            .select('*')
            .in('referred_by', l2Codes);
          l3 = l3Data || [];
        }
      }
      setLevel3(l3);

      const { data: commissions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'referral_bonus');
              
      if (commissions) {
        setTotalCommissions(commissions.reduce((acc, curr) => acc + Number(curr.amount), 0));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTotalMembers = () => level1.length + level2.length + level3.length;
  
  const getActiveLevelData = () => {
    if (activeTab === 1) return level1;
    if (activeTab === 2) return level2;
    return level3;
  };

  return (
    <div className="px-5 pt-8 pb-32 min-h-screen bg-slate-50 max-w-lg mx-auto font-sans">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 px-2">Équipe</h2>
      
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8"
      >
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Votre lien d'invitation</p>
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-xl flex-1 text-sm font-semibold text-slate-700 truncate shadow-inner">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-sm ${
              copied ? 'bg-orange-50 text-orange-500 border border-orange-100' : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
            }`}
          >
            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center px-1">
          <div className="text-center">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 1</p>
            <p className="text-orange-600 font-black text-sm">10%</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 2</p>
            <p className="text-orange-600 font-black text-sm">5%</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 3</p>
            <p className="text-orange-600 font-black text-sm">2.5%</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-5 shadow-lg shadow-orange-500/20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-[20px] -mr-4 -mt-4"></div>
          <UserPlus className="w-6 h-6 text-orange-200 mb-3" />
          <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Membres</p>
          <p className="text-3xl font-black">{getTotalMembers()}</p>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-gradient-to-br from-orange-600 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-600/20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-[20px] -mr-4 -mt-4"></div>
          <Gift className="w-6 h-6 text-green-200 mb-3" />
          <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest mb-1">Commissions</p>
          <p className="text-2xl font-black mt-1 truncate">{formatCurrency(totalCommissions)}</p>
        </motion.div>
      </div>

      <div className="mb-6 flex p-1 bg-slate-200/50 rounded-2xl">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === level 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Niveau {level}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {getActiveLevelData().length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Aucun membre au niveau {activeTab}.</p>
          </div>
        ) : (
          getActiveLevelData().map((member, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member.id} 
              className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{member.country && COUNTRIES[member.country as CountryName] ? COUNTRIES[member.country as CountryName].code : ""} {member.phone || (member.first_name + " " + member.last_name)}</p>
                <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mt-0.5">Rejoint le {new Date(member.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
