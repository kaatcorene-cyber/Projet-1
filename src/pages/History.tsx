import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock, Download, Upload, TrendingUp, Gift, Gem, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function History() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    // Polling for real-time history updates (Reduced frequency to save database quota)
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000 * 2);

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
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans">
      <header className="flex justify-between items-center pb-4 border-b border-gray-200/60 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Historique</h1>
          <p className="text-gray-500 text-xs font-semibold mt-1">VOS TRANSACTIONS</p>
        </div>
        <img src="https://i.imgur.com/bjYgoI6.png" alt="Logo" className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-200 flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm font-semibold">
            Aucune transaction
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight text-base">
                      {tx.type === 'deposit' && 'Dépôt'}
                      {tx.type === 'withdrawal' && 'Retrait'}
                      {tx.type === 'investment' && 'Investissement'}
                      {tx.type === 'daily_gain' && 'Gain journalier'}
                      {tx.type === 'signup_bonus' && 'Bonus inscript.'}
                      {tx.type === 'referral_bonus' && 'Bonus parrain.'}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                      {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black tracking-tight ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'text-green-600' 
                      : 'text-gray-900'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    tx.status === 'completed' || tx.status === 'approved' ? 'text-green-600' :
                    tx.status === 'pending' ? 'text-amber-500' : 'text-purple-500'
                  }`}>
                    {tx.status === 'completed' || tx.status === 'approved' ? 'Complété' :
                     tx.status === 'pending' ? 'En attente' : 'Rejeté'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
