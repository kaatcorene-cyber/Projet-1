import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    const { data: txs } = await supabase
      .from('transactions')
      .select('*, users(first_name, last_name, phone)')
      .in('type', ['deposit', 'withdrawal'])
      .order('created_at', { ascending: false });
    
    if (txs) setTransactions(txs);

    const { data: link } = await supabase.from('settings').select('value').eq('key', 'payment_link').single();
    if (link) setPaymentLink(link.value);
  };

  const handleUpdateLink = async () => {
    setLoading(true);
    await supabase.from('settings').upsert({ key: 'payment_link', value: paymentLink });
    setLoading(false);
    alert('Lien mis à jour');
  };

  const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {
    // Update tx status
    await supabase.from('transactions').update({ status }).eq('id', id);

    if (status === 'approved') {
      // If deposit, add to balance
      if (type === 'deposit') {
        const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (userData) {
          await supabase.from('users').update({ balance: userData.balance + amount }).eq('id', userId);
        }
      }
      // If withdrawal, balance was already deducted on request. If rejected, we should refund.
    } else if (status === 'rejected' && type === 'withdrawal') {
      // Refund balance
      const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
      if (userData) {
        await supabase.from('users').update({ balance: userData.balance + amount }).eq('id', userId);
      }
    }

    fetchData();
  };

  return (
    <div className="p-6 space-y-6 pb-24 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lien de paiement</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            onClick={handleUpdateLink}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-xl font-medium transition-colors shadow-sm"
          >
            Sauver
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dépôts & Retraits</h2>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">
                    {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'} - {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Ref: {tx.reference}</p>
                  <p className="text-xs text-gray-400">{format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                  tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {tx.status}
                </div>
              </div>
              
              {tx.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approuver
                  </button>
                  <button 
                    onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
