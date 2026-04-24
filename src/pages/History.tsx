import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function History() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    // Polling for real-time history updates
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    // Fetch all transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (txData) {
      setTransactions(txData);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historique</h1>
          <p className="text-white/80 text-sm mt-1">Toutes vos transactions</p>
        </div>
        <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
          <img src="https://i.imgur.com/3UdOmrc.png" alt="Petrolimex" className="h-8 object-contain" referrerPolicy="no-referrer" />
        </div>
      </header>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm font-medium bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            Aucune transaction
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                    ? 'bg-emerald-50 text-emerald-500' 
                    : 'bg-red-50 text-red-500'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {tx.type === 'deposit' && 'Dépôt'}
                    {tx.type === 'withdrawal' && 'Retrait'}
                    {tx.type === 'investment' && 'Investissement'}
                    {tx.type === 'daily_gain' && 'Gain journalier'}
                    {tx.type === 'signup_bonus' && 'Bonus inscription'}
                    {tx.type === 'referral_bonus' && 'Bonus parrainage'}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                    ? 'text-emerald-500' 
                    : 'text-gray-900'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className={`text-[10px] font-medium uppercase mt-1 ${
                  tx.status === 'completed' || tx.status === 'approved' ? 'text-emerald-500' :
                  tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {tx.status === 'completed' || tx.status === 'approved' ? 'Complété' :
                   tx.status === 'pending' ? 'En attente' : 'Rejeté'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
