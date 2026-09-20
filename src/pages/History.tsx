import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';
import { ArrowDownLeft, ArrowUpRight, Truck, Gift, History as HistoryIcon, Clock } from 'lucide-react';

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

  const isPositive = (type: string) => {
    const positiveTypes = [
      'deposit', 
      'daily_gain', 
      'signup_bonus', 
      'referral_bonus', 
      'bonus', 
      'commission', 
      'parrainage'
    ];
    return positiveTypes.includes(type?.toLowerCase());
  };

  const getTransactionDetails = (tx: { type?: string; reference?: string }) => {
    const type = (tx.type || '').toLowerCase();
    const ref = (tx.reference || '').toLowerCase();

    if (
      type === 'commission' || 
      ref.includes('palier') || 
      ref.includes('équipe') || 
      ref.includes('membres') ||
      ref.startsWith('commission palier')
    ) {
      return { title: 'Commission Équipe', icon: Gift, category: 'commission' };
    }

    if (
      type === 'referral_bonus' || 
      type === 'bonus' || 
      type === 'parrainage' || 
      ref.includes('parrainage') || 
      ref.includes('niveau')
    ) {
      return { title: 'Bonus de Parrainage', icon: Gift, category: 'commission' };
    }

    switch (type) {
      case 'deposit': 
        return { title: 'Recharge Reçue', icon: ArrowDownLeft, category: 'deposit' };
      case 'withdrawal': 
        return { title: 'Retrait Versé', icon: ArrowUpRight, category: 'withdrawal' };
      case 'investment': 
        return { title: 'Souscription Flotte', icon: Truck, category: 'investment' };
      case 'daily_gain': 
        return { title: 'Rendement Flotte 24h', icon: Truck, category: 'daily_gain' };
      case 'signup_bonus': 
        return { title: 'Prime de Bienvenue', icon: Gift, category: 'commission' };
      default: 
        return { title: 'Transaction Flotte', icon: HistoryIcon, category: 'other' };
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center transition-all">
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">Historiques</h1>
          <p className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">Journal des Opérations</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-xl mx-auto space-y-3 px-3 sm:px-0">
        {/* Transactions List */}
        <div className="space-y-2.5">
          {transactions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 shadow-sm">
              <HistoryIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Aucune transaction pour le moment
              </p>
              <p className="text-xs text-slate-500">
                Vos prochaines opérations s'afficheront ici en temps réel.
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const positive = isPositive(tx.type);
              const { title, icon: Icon } = getTransactionDetails(tx);

              return (
                <div 
                  key={tx.id} 
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      positive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                        {title}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {format(new Date(tx.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-sm sm:text-base font-black tracking-tight ${
                      positive ? 'text-emerald-700' : 'text-slate-900'
                    }`}>
                      {positive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 border ${
                      tx.status === 'completed' || tx.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : tx.status === 'rejected'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      {tx.status === 'completed' || tx.status === 'approved' ? 'Validé' : tx.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
