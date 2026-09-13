import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppLogo } from '../components/AppLogo';

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

  const getTransactionTitle = (tx: { type?: string; reference?: string }) => {
    const type = (tx.type || '').toLowerCase();
    const ref = (tx.reference || '').toLowerCase();

    // 1. Commission : paliers d'équipe (Commissions de membres ou palier) ou type commission
    if (
      type === 'commission' || 
      ref.includes('palier') || 
      ref.includes('équipe') || 
      ref.includes('membres') ||
      ref.startsWith('commission palier')
    ) {
      return 'Commission';
    }

    // 2. Bonus de parrainage : commissions sur dépôt filleul (Niveau 1, 2, 3), bonus affiliation, bonus parrainage
    if (
      type === 'referral_bonus' || 
      type === 'bonus' || 
      type === 'parrainage' || 
      ref.includes('parrainage') || 
      ref.includes('niveau')
    ) {
      return 'Bonus de parrainage';
    }

    // 3. Types classiques
    switch (type) {
      case 'deposit': 
        return 'Dépôt';
      case 'withdrawal': 
        return 'Retrait';
      case 'investment': 
        return 'Investissement Culture';
      case 'daily_gain': 
        return 'Gain journalier';
      case 'signup_bonus': 
        return 'Bonus de bienvenue';
      default: 
        return 'Bonus de parrainage';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-5 pt-6 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>

      <header className="flex justify-between items-center pb-4 border-b border-black/5 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Histoire</h1>
          <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider mt-0.5">Flux des Transactions</p>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-10" />
      </header>

      {/* Directly on the page - No card wrapper, no icons behind notifications */}
      <div className="relative z-10 mt-4">
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs font-bold tracking-wider uppercase">
            Aucune transaction enregistrée
          </div>
        ) : (
          <div className="divide-y divide-gray-200/80">
            {transactions.map((tx) => {
              const positive = isPositive(tx.type);
              const title = getTransactionTitle(tx);
              return (
                <div 
                  key={tx.id} 
                  className="py-3.5 px-1 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">
                      {title}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {format(new Date(tx.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className={`text-base font-black tracking-tight ${
                      positive ? 'text-emerald-600' : 'text-gray-900'
                    }`}>
                      {positive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 ${
                      tx.status === 'completed' || tx.status === 'approved' 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-500/20' 
                        : tx.status === 'pending' 
                          ? 'text-amber-700 bg-amber-50 border border-amber-500/20' 
                          : 'text-red-700 bg-red-50 border border-red-500/20'
                    }`}>
                      {tx.status === 'completed' || tx.status === 'approved' ? 'Validé' :
                       tx.status === 'pending' ? 'En cours' : 'Rejeté'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
