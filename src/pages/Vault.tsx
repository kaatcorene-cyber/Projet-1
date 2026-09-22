import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

export function Vault() {
  const { user, setUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const { data: settingData, error: settingError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'vault_' + code.trim().toUpperCase())
        .single();
        
      if (settingError || !settingData) {
        setMessage({ type: 'error', text: 'Code invalide ou introuvable.' });
        setLoading(false);
        return;
      }
      
      const vault = JSON.parse(settingData.value);
      
      if (vault.remaining_amount <= 0) {
        setMessage({ type: 'error', text: "L'enveloppe rouge a expiré." });
        setLoading(false);
        return;
      }
      
      if (vault.claimed_by && vault.claimed_by.includes(user.id)) {
        setMessage({ type: 'error', text: 'Vous avez déjà réclamé ce coffre.' });
        setLoading(false);
        return;
      }
      
      // Calculate random amount between 50 and 200
      let claimAmount = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
      // Round to nearest 10
      claimAmount = Math.round(claimAmount / 10) * 10;
      
      if (claimAmount > vault.remaining_amount) {
        claimAmount = vault.remaining_amount;
      }
      
      vault.remaining_amount -= claimAmount;
      if (!vault.claimed_by) vault.claimed_by = [];
      vault.claimed_by.push(user.id);
      
      // Update Vault
      await supabase.from('settings').update({ value: JSON.stringify(vault) }).eq('key', 'vault_' + code.trim().toUpperCase());
      
      // Update User balance
      const newBalance = (user.balance || 0) + claimAmount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      setUser({ ...user, balance: newBalance });
      
      // Insert Transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'bonus',
        amount: claimAmount,
        status: 'approved',
        reference: 'Coffre: ' + code.trim().toUpperCase()
      });
      
      setMessage({ type: 'success', text: `Félicitations ! Vous avez reçu ${claimAmount} FCFA.` });
      setCode('');
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-32 min-h-[100dvh] bg-slate-50 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Coffre</h1>
          <p className="text-slate-500 text-sm font-medium">Réclamez vos enveloppes rouges</p>
        </div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm font-semibold">{message.text}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Entrez un code</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Si vous avez reçu un code de coffre, entrez-le ci-dessous pour débloquer votre bonus.
          </p>
          
          <form onSubmit={handleClaim} className="w-full space-y-4">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="EX: CADEAU1000"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-center font-black text-xl tracking-widest focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all uppercase"
              required
            />
            
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ouvrir le coffre'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
