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
      <header className="flex justify-between items-center pb-4 border-b border-zinc-800/60 mb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight">Historique</h1>
          <p className="text-zinc-400 text-xs font-semibold mt-1">VOS TRANSACTIONS</p>
        </div>
        <img src="https://i.imgur.com/CDLHO6I.png" alt="Fuel•Max" className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-zinc-800 flex-shrink-0" referrerPolicy="no-referrer" />
      </header>

      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-xl rounded-3xl overflow-hidden mb-8">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm font-semibold">
            Aucune transaction
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-zinc-50 leading-tight text-base">
                      {tx.type === 'deposit' && 'Dépôt'}
                      {tx.type === 'withdrawal' && 'Retrait'}
                      {tx.type === 'investment' && 'Investissement'}
                      {tx.type === 'daily_gain' && 'Gain journalier'}
                      {tx.type === 'signup_bonus' && 'Bonus inscript.'}
                      {tx.type === 'referral_bonus' && 'Bonus parrain.'}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                      {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black tracking-tight ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'text-emerald-400' 
                      : 'text-zinc-50'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    tx.status === 'completed' || tx.status === 'approved' ? 'text-emerald-400' :
                    tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
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
