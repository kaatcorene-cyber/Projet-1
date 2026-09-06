import fs from 'fs';

const content = `import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowDown, ArrowUp, Clock, Plus, TrendingUp, Gift, CreditCard, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function History() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (type === 'withdrawal' || type === 'investment') return 'bg-white/10 text-white';
    if (type === 'deposit') return 'bg-brand-500/20 text-brand-400';
    return 'bg-brand-500/20 text-brand-400';
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': 
      case 'approved': return <span className="text-brand-400 text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">Payé</span>;
      case 'pending': return <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">En attente</span>;
      case 'rejected': return <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">Rejeté</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#03296c] font-sans relative text-white z-20">
      <div className="px-5 pt-12 pb-32 max-w-lg mx-auto">
        <header className="flex items-center gap-4 mb-8 relative z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/20 transition-colors shadow-sm shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Historique</h1>
            <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Vos transactions</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <Clock className="w-8 h-8 text-blue-200/60" />
            </div>
            <p className="text-blue-200/60 font-medium text-sm">Aucun mouvement pour le moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 relative z-10">
            {transactions.map((tx, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={tx.id} 
                className={\`flex items-center justify-between py-4 \${idx !== transactions.length - 1 ? 'border-b border-white/10' : ''}\`}
              >
                <div className="flex items-center gap-4">
                  <div className={\`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border border-white/5 \${getIconColor(tx.type)}\`}>
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-[15px] leading-tight mb-1">
                      {tx.type === 'referral_bonus' && tx.reference ? tx.reference : getLabel(tx.type)}
                    </p>
                    <p className="text-blue-200/60 text-[11px] font-medium uppercase tracking-wider">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short'
                      })} • {new Date(tx.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={\`font-black text-[16px] leading-tight mb-1 \${tx.type === 'withdrawal' || tx.type === 'investment' ? 'text-white' : 'text-brand-400'}\`}>
                    {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <div className="flex justify-end mt-1">
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
\`;

fs.writeFileSync('src/pages/History.tsx', content);
