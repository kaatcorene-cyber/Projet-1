import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowDown, ArrowUp, Clock, Plus, TrendingUp, Gift, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export function History() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <ArrowDown className="w-5 h-5" />;
      case 'withdrawal': return <ArrowUp className="w-5 h-5" />;
      case 'daily_gain': return <Plus className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'referral_bonus': return <Gift className="w-5 h-5" />;
      case 'signup_bonus': return <Gift className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch(type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'daily_gain': return 'Gain journalier';
      case 'investment': return 'Investissement';
      case 'referral_bonus': return 'Parrainage';
      case 'signup_bonus': return 'Inscription';
      default: return 'Transaction';
    }
  };

  const getIconColor = (type: string) => {
    if (type === 'referral_bonus') return 'bg-orange-50 text-orange-500';
    if (type === 'withdrawal' || type === 'investment') return 'bg-slate-100 text-slate-700';
    if (type === 'deposit') return 'bg-orange-50 text-orange-600';
    return 'bg-orange-50 text-orange-600';
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="text-orange-500 text-[11px] font-bold">Payé</span>;
      case 'pending': return <span className="text-amber-500 text-[11px] font-bold">En attente</span>;
      case 'rejected': return <span className="text-red-500 text-[11px] font-bold">Rejeté</span>;
      default: return null;
    }
  };

  return (
    <div className="px-4 pt-8 pb-32 min-h-screen bg-slate-50 max-w-lg mx-auto font-sans">
      
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 px-2">Transactions</h2>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Aucun mouvement pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[28px] shadow-sm border border-slate-100/60 overflow-hidden">
          {transactions.map((tx, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={tx.id} 
              className={`flex items-center justify-between p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 ${getIconColor(tx.type)}`}>
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-[15px] leading-tight">{getLabel(tx.type)}</p>
                  <p className="text-slate-400 text-[12px] font-medium mt-1">
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short'
                    })} • {new Date(tx.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-black text-[15px] leading-tight text-slate-900`}>
                  {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}{formatCurrency(tx.amount)}
                </p>
                <div className="mt-1">
                  {getStatusBadge(tx.status)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
