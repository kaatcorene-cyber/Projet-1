import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency, generateUserId } from '../lib/utils';
import { COUNTRIES, CountryName } from '../constants';
import { Users, User, Copy, CheckCircle2, UserPlus, Gift, ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Team() {
  const { user } = useAuthStore();
  const [level1, setLevel1] = useState<any[]>([]);
  const [level2, setLevel2] = useState<any[]>([]);
  const [level3, setLevel3] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [copied, setCopied] = useState(false);
  const [totalCommissions, setTotalCommissions] = useState(0);
  
    const navigate = useNavigate();

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const fetchTeam = async () => {
    if (!user) return;
    try {
      const refCode = user.referral_code?.toUpperCase();
      const legacyRefCode = generateUserId(user.id);
      
      let orConds = [];
      if (refCode) orConds.push(`referred_by.eq.${refCode}`);
      if (legacyRefCode) orConds.push(`referred_by.eq.${legacyRefCode}`);
      
      const { data: l1Data } = await supabase
        .from('users')
        .select('*')
        .or(orConds.join(','));
        
      const l1 = l1Data || [];
      setLevel1(l1);

      let l2: any[] = [];
      if (l1.length > 0) {
        const l1Codes = l1.flatMap(u => [u.referral_code, generateUserId(u.id)]).filter(Boolean);
        if (l1Codes.length > 0) {
          const { data: l2Data } = await supabase
            .from('users')
            .select('*')
            .in('referred_by', l1Codes);
          l2 = l2Data || [];
        }
      }
      setLevel2(l2);

      let l3: any[] = [];
      if (l2.length > 0) {
        const l2Codes = l2.flatMap(u => [u.referral_code, generateUserId(u.id)]).filter(Boolean);
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

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || generateUserId(user?.id)}`;

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
    <div className="min-h-[100dvh] bg-[#03296c] p-4 pt-10 pb-32 font-sans text-white relative">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Mon Équipe</h1>
          <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Parrainage</p>
        </div>
      </header>
      
      <div className="bg-brand-500 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <p className="text-brand-100 text-[10px] font-bold uppercase tracking-widest mb-1.5">Lien d'invitation</p>
            <div className="flex items-center gap-2">
              <div className="bg-brand-600/50 border border-brand-400/30 px-3.5 py-2.5 rounded-xl flex-1 text-sm font-medium truncate shadow-inner flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-brand-200 shrink-0" />
                <span className="truncate text-brand-50">{referralLink}</span>
              </div>
              <button
                onClick={copyLink}
                className="w-10 h-10 bg-white/10 text-brand-600 flex items-center justify-center rounded-xl shadow-sm hover:bg-brand-50 transition-colors shrink-0 active:scale-95"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-brand-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-400/30 flex justify-around items-center">
            <div className="text-center">
              <p className="text-brand-200 text-[9px] font-bold uppercase tracking-wider mb-1">Total Membres</p>
              <p className="font-black text-lg">{getTotalMembers()}</p>
            </div>
            <div className="w-[1px] h-10 bg-brand-400/30"></div>
            <div className="text-center">
              <p className="text-brand-200 text-[9px] font-bold uppercase tracking-wider mb-1">Commissions</p>
              <p className="font-black text-lg">{formatCurrency(totalCommissions)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white/10/50 p-1 rounded-xl mb-6">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === level
                  ? 'bg-white/10 text-brand-600 shadow-sm'
                  : 'text-blue-200/60 hover:text-white/90'
            }`}
          >
            Niveau {level}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {getActiveLevelData().length === 0 ? (
          <div className="text-center py-10 bg-white/10 border border-white/20 rounded-2xl">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-blue-200/60 text-sm font-medium">Aucun membre au niveau {activeTab}.</p>
          </div>
        ) : (
          getActiveLevelData().map((member, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member.id} 
              className="bg-white/10 p-4 rounded-2xl border border-white/20 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate text-sm">{member.country && COUNTRIES[member.country as CountryName] ? COUNTRIES[member.country as CountryName].code : ""} {member.phone || (member.first_name + " " + member.last_name)}</p>
                <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1">REJOINT LE {new Date(member.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
