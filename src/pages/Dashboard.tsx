import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const { user, refreshUser } = useAuthStore();
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailyGain, setDailyGain] = useState(0);

  useEffect(() => {
    refreshUser();
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    // Fetch active investments
    const { data: invData } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (invData) {
      setActiveInvestments(invData);
      const totalDaily = invData.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }

    // Fetch recent transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (txData) {
      setTransactions(txData);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Bonjour,</p>
          <h1 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h1>
        </div>
        <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
      </header>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <p className="text-emerald-50 text-sm font-medium mb-1">Solde Total</p>
        <h2 className="text-4xl font-bold tracking-tight mb-6">{formatCurrency(user?.balance || 0)}</h2>
        
        <div className="flex gap-3">
          <Link to="/deposit" className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium backdrop-blur-sm">
            <ArrowDownRight className="w-4 h-4" />
            Dépôt
          </Link>
          <Link to="/withdraw" className="flex-1 bg-black/10 hover:bg-black/20 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium backdrop-blur-sm">
            <ArrowUpRight className="w-4 h-4" />
            Retrait
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-gray-500 text-xs font-medium mb-1">Gains Journaliers</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(dailyGain)}</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-gray-500 text-xs font-medium mb-1">Invest. Actifs</p>
          <p className="text-lg font-bold text-gray-900">{activeInvestments.length}</p>
        </div>
      </div>
      
    </div>
  );
}
