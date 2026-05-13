import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function History() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (txData) {
      setTransactions(txData);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 pb-24 font-sans overflow-x-hidden relative">
      <header className="bg-white/80 backdrop-blur-xl rounded-none rounded-b-3xl px-5 pt-12 pb-4 border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Historique</h1>
          <p className="text-neutral-500 font-medium text-xs mt-0.5">Flux de transactions</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 overflow-hidden shadow-sm p-1">
           <img src="https://i.imgur.com/HfAOyni.jpeg" alt="SIM" className="w-full h-full object-contain" />
        </div>
      </header>

      <div className="px-5 pt-6 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-sm font-semibold tracking-wider">
            Aucun transit détecté
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'bg-brand/10 text-brand border-brand/20' 
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">
                      {tx.type === 'deposit' && 'Dépôt'}
                      {tx.type === 'withdrawal' && 'Retrait'}
                      {tx.type === 'investment' && 'Investissement'}
                      {tx.type === 'daily_gain' && 'Gains quotidiens'}
                      {tx.type === 'signup_bonus' && 'Bonus d\'inscription'}
                      {tx.type === 'referral_bonus' && 'Bonus de parrainage'}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest mt-0.5">
                      {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[15px] font-bold tracking-tight ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'text-brand' 
                      : 'text-neutral-900'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md inline-block border ${
                    tx.status === 'completed' || tx.status === 'approved' ? 'text-brand bg-brand/10 border-brand/20' :
                    tx.status === 'pending' ? 'text-[#ff9800] bg-[#fff3e0] border-[#ffe0b2]' : 'text-neutral-500 bg-neutral-100 border-neutral-200'
                  }`}>
                    {tx.status === 'completed' || tx.status === 'approved' ? 'Validé' :
                     tx.status === 'pending' ? 'Traitement' : 'Rejeté'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
