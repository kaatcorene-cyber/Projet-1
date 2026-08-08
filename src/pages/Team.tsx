import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
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
    if (!user || !user.referral_code) return;
    try {
      const { data: l1Data } = await supabase
        .from('users')
        .select('*')
        .eq('referred_by', user.referral_code?.toUpperCase());
        
      const l1 = l1Data || [];
      setLevel1(l1);

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
    <div className="min-h-screen bg-slate-50 p-4 pt-10 pb-32 font-sans text-slate-900 relative">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Mon Équipe</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Parrainage</p>
        </div>
      </header>
      
      <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1.5">Lien d'invitation</p>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600/50 border border-emerald-400/30 px-3.5 py-2.5 rounded-xl flex-1 text-sm font-medium truncate shadow-inner flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-200 shrink-0" />
                <span className="truncate text-emerald-50">{referralLink}</span>
              </div>
              <button
                onClick={copyLink}
                className="w-10 h-10 bg-white text-emerald-600 flex items-center justify-center rounded-xl shadow-sm hover:bg-emerald-50 transition-colors shrink-0 active:scale-95"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-emerald-400/30 flex justify-between items-center">
            <div className="text-center">
              <p className="text-emerald-200 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 1</p>
              <p className="font-black text-sm">10%</p>
            </div>
            <div className="w-[1px] h-6 bg-emerald-400/30"></div>
            <div className="text-center">
              <p className="text-emerald-200 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 2</p>
              <p className="font-black text-sm">5%</p>
            </div>
            <div className="w-[1px] h-6 bg-emerald-400/30"></div>
            <div className="text-center">
              <p className="text-emerald-200 text-[9px] font-bold uppercase tracking-wider mb-1">Niveau 3</p>
              <p className="font-black text-sm">2.5%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
             <UserPlus className="w-4 h-4" />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Membres</p>
          <p className="text-slate-900 font-black text-lg">{getTotalMembers()}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
             <Gift className="w-4 h-4" />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Commissions</p>
          <p className="text-slate-900 font-black text-lg">{formatCurrency(totalCommissions)}</p>
        </div>
      </div>

            <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === level
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Niveau {level}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {getActiveLevelData().length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Aucun membre au niveau {activeTab}.</p>
          </div>
        ) : (
          getActiveLevelData().map((member, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member.id} 
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate text-sm">{member.country && COUNTRIES[member.country as CountryName] ? COUNTRIES[member.country as CountryName].code : ""} {member.phone || (member.first_name + " " + member.last_name)}</p>
                <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1">REJOINT LE {new Date(member.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
