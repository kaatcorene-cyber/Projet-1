import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  
  const availableMethods = ['Wave', 'Moov Money', 'MTN Mobile Money'];

  const [method, setMethod] = useState(availableMethods[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const nowLocal = new Date();
    const gmtDay = nowLocal.getUTCDay();
    const gmtHour = nowLocal.getUTCHours();
    
    if (gmtDay === 0) {
      return setMessage({ type: 'error', text: 'Opérations de retrait suspendues le dimanche.' });
    }
    if (gmtHour < 9 || gmtHour >= 17) {
      return setMessage({ type: 'error', text: 'Horaires d\'ouverture des retraits : 09:00 - 17:00 GMT.' });
    }
    
    const numAmount = Number(amount);
    
    if (numAmount < 1500) {
      return setMessage({ type: 'error', text: 'Retrait minimum requis : 1 500 FCFA.' });
    }

    if (Number(user.balance) < numAmount) {
      return setMessage({ type: 'error', text: 'Solde disponible insuffisant.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password_hash', password)
        .single();

      if (!userData) {
        setLoading(false);
        return setMessage({ type: 'error', text: 'Mot de passe incorrect.' });
      }

      const newBalance = user.balance - numAmount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `${method} - ${phone} (Côte d'Ivoire)`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Demande de retrait enregistrée. Validation sous 24h.' });
      setAmount('');
      setPhone('');
      setPassword('');
      setMethod(availableMethods[0] || '');
    } catch (err) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de votre demande.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-5 pt-8 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white border border-black/10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Retrait</h1>
            <p className="text-emerald-600 text-[10px] uppercase font-bold tracking-wider">Récupération des gains</p>
          </div>
        </div>
        <AppLogo imgClassName="h-7 w-auto object-contain max-h-9" />
      </header>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center justify-center mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-center">Solde Disponible</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(user?.balance || 0)}</h2>
          <div className="mt-3 px-3 py-1 bg-emerald-50 border border-emerald-500/20 text-emerald-700 rounded-lg text-xs font-bold text-center">
            Frais de retrait réseau : 10%
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in zoom-in duration-200 ${
              message.type === 'success' ? 'bg-emerald-50 border border-emerald-500/20 text-emerald-800' : 'bg-red-50 border border-red-500/20 text-red-600'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Montant à retirer (FCFA)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-lg font-black text-emerald-600 placeholder-gray-300 mt-1 focus:outline-none focus:border-emerald-500"
                placeholder="1500"
                required
                min="1500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Moyen de réception</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 mt-1 focus:outline-none focus:border-emerald-500"
                required
              >
                {availableMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Numéro de réception</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 placeholder-gray-400 mt-1 focus:outline-none focus:border-emerald-500"
                placeholder="+225 000 000"
                required
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mot de passe de confirmation</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 placeholder-gray-400 mt-1 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {amount && Number(amount) >= 1500 && (
            <div className="text-xs font-medium text-center text-gray-600 bg-white border border-black/5 py-3 px-4 rounded-xl shadow-sm">
              Montant net à recevoir (après déduction des frais de 10%) : <br/>
              <span className="font-black text-xl text-emerald-600 mt-0.5 inline-block">{formatCurrency(Number(amount) * 0.90)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!!message && message.type === 'success')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Vérification...' : 'Valider le retrait'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
