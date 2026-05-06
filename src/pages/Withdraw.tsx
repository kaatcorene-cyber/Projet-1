import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Withdraw() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const country = user?.country || "Cote d'Ivoire";
  
  let availableMethods = ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money'];
  if (country === 'Togo') availableMethods = ['Moov Money', 'T-Money'];
  else if (country === 'Burkina Faso') availableMethods = ['Orange Money', 'Moov Money', 'Wave'];
  else if (country === 'Benin') availableMethods = ['Moov Money', 'MTN Mobile Money', 'Celtiis'];

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
      return setMessage({ type: 'error', text: 'Opérations de retrait suspendues le dimanche (Maintenance réseau).' });
    }
    if (gmtHour < 9 || gmtHour >= 17) {
      return setMessage({ type: 'error', text: 'Fenêtre de retrait fermée. Horaires d\'ouverture : 09:00 - 17:00 GMT.' });
    }
    
    const numAmount = Number(amount);
    
    if (numAmount < 1500) {
      return setMessage({ type: 'error', text: 'Extraction minimum requise : 1 500 FCFA.' });
    }

    if (Number(user.balance) < numAmount) {
      return setMessage({ type: 'error', text: 'Énergie disponible insuffisante.' });
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
        return setMessage({ type: 'error', text: 'Clé d\'autorisation rejetée. Mot de passe incorrect.' });
      }

      const newBalance = user.balance - numAmount;
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'withdrawal',
        amount: numAmount,
        reference: `${method} - ${phone} (${country})`,
        status: 'pending'
      }]);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Demande d\'extraction validée. Propagation dans le réseau sous 24h.' });
      setAmount('');
      setPhone('');
      setPassword('');
      setMethod(availableMethods[0] || '');
    } catch (err) {
      setMessage({ type: 'error', text: 'Défaillance système inattendue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-5 pt-16 pb-24 font-sans relative overflow-x-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <header className="flex items-center gap-4 mb-8 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#111] border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors shadow-lg shadow-black/50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight">Retrait</h1>
           <p className="text-amber-500 text-[10px] uppercase font-bold tracking-widest">Extraction des gains</p>
        </div>
      </header>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="bg-[#111] p-6 rounded-[2rem] shadow-2xl border border-white/5 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 shadow-sm text-center">Puissance Disponible</p>
             <h2 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(user?.balance || 0)}</h2>
             <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold uppercase tracking-widest text-center shadow-inner">
               Frais d'extraction réseau : 20%
             </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-200 ${
              message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <AlertCircle className="w-5 h-5 shrink-0" />
              {message.text}
            </div>
          )}

          <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 bg-[#1a1a1a]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Volume à extraire (XOF)</label>
              <div className="flex items-center mt-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-amber-500 placeholder-amber-500/30 outline-none"
                  placeholder="1500"
                  required
                  min="1500"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Canal de réception</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white mt-1 appearance-none outline-none"
                required
              >
                {availableMethods.map(m => (
                  <option key={m} value={m} className="bg-[#111] text-white">{m}</option>
                ))}
              </select>
            </div>

            <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Identifiant cible (Téléphone)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white placeholder-gray-600 mt-1 outline-none tracking-wider"
                placeholder="+225 000 000"
                required
              />
            </div>
            
            <div className="px-5 py-4 bg-[#0a0a0a]/50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Clé d'autorisation (Mot de passe)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white placeholder-gray-600 mt-1 outline-none tracking-wider"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {amount && Number(amount) >= 1500 && (
            <p className="text-sm font-medium text-center text-gray-400 bg-[#111] border border-white/5 py-4 rounded-2xl shadow-inner">
              Rendement net estimé : <br/>
              <span className="font-black text-2xl text-amber-500 drop-shadow-md">{formatCurrency(Number(amount) * 0.80)}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (!!message && message.type === 'success')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 flex items-center justify-center gap-2 mt-8"
          >
            {loading ? 'Vérification...' : 'Lancer l\'extraction'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
