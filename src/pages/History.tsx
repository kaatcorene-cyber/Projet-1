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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-5 pt-16 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <header className="flex justify-between items-end pb-6 border-b border-white/5 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Historique</h1>
          <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">Flux d'Énergie</p>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
           <Sun className="w-8 h-8 text-amber-500" />
           <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">SOLEIL<span className="text-amber-500">-POWER</span></span>
        </div>
      </header>

      <div className="relative z-10 mt-6 bg-[#111] rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm font-bold tracking-wider uppercase">
            Aucun transit détecté
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner border ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">
                      {tx.type === 'deposit' && 'Dépôt'}
                      {tx.type === 'withdrawal' && 'Retrait'}
                      {tx.type === 'investment' && 'Investissement'}
                      {tx.type === 'daily_gain' && 'Gains quotidiens'}
                      {tx.type === 'signup_bonus' && 'Bonus d\'inscription'}
                      {tx.type === 'referral_bonus' && 'Bonus de parrainage'}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-shadow-sm">
                      {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black tracking-tighter drop-shadow-md ${
                    tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus'
                      ? 'text-green-400' 
                      : 'text-white'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'daily_gain' || tx.type === 'signup_bonus' || tx.type === 'referral_bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                    tx.status === 'completed' || tx.status === 'approved' ? 'text-green-500' :
                    tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
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
  );
}
