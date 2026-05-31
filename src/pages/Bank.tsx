import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Save, CreditCard, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Bank() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [method, setMethod] = useState((user as any)?.bank_method || '');
  const [accountName, setAccountName] = useState(() => {
    let name = '';
    const bAccountName = (user as any)?.bank_account_name;
    if (bAccountName) {
      name = bAccountName.split('|||')[0] || '';
    }
    return name;
  });
  const [accountNumber, setAccountNumber] = useState(() => {
    let num = '';
    const bAccountName = (user as any)?.bank_account_name;
    if (bAccountName) {
      const parts = bAccountName.split('|||');
      if (parts.length > 1) {
        num = parts[1] || '';
      }
    }
    return num;
  });
  const [password, setPassword] = useState('');
  
  const [isLinked, setIsLinked] = useState(() => {
    const bMethod = (user as any)?.bank_method;
    const bAccountName = (user as any)?.bank_account_name;
    return Boolean(bMethod && bAccountName && bAccountName.includes('|||'));
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Just refresh user data in the background
      refreshUser();
      
      const bMethod = (user as any)?.bank_method;
      const bAccountName = (user as any)?.bank_account_name;
      
      if (!method && bMethod) setMethod(bMethod);
      if (!accountName && bAccountName) {
        setAccountName(bAccountName.split('|||')[0] || '');
        if (bAccountName.includes('|||')) {
          setAccountNumber(bAccountName.split('|||')[1] || '');
        }
      }
      
      if (bMethod && bAccountName && bAccountName.includes('|||')) {
         setIsLinked(true);
      } else {
         setIsLinked(false);
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !accountNumber || !password) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Very basic password verify against current user's hash
      // A better way is server-side but we are in a pure client flow right now.
      const { data: userData } = await supabase.from('users').select('password_hash').eq('id', user?.id).single();
      
      if (userData?.password_hash !== password) {
        setMessage({ type: 'error', text: 'Mot de passe incorrect.' });
        setIsSaving(false);
        return;
      }
      
      const packedName = `${accountName || 'Client'}|||${accountNumber}`;

      try {
        await supabase.from('users').update({ 
          bank_method: method, 
          bank_account_name: packedName
        }).eq('id', user?.id);
      } catch(e) {}
      
      // Save to Settings as fallback for Admin
      try {
        await supabase.from('settings').upsert({
          key: 'bank_' + user?.id,
          value: JSON.stringify({ bank_method: method, bank_account_name: packedName })
        });
      } catch(e) {}
      
      
      setIsLinked(true);
      setMessage({ type: 'success', text: 'Vos informations bancaires ont été enregistrées avec succès.' });
      setPassword('');
      refreshUser();
    } catch (err: any) {
       console.error("Save bank mode error", err);
       setMessage({ type: 'error', text: err.message || 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans animate-fade-in text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Ma Banque</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Gérer vos paiements</p>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
             {message.text}
          </div>
        )}

        {isLinked ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>

            <div className="w-24 h-24 bg-zinc-800 border border-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10">
              <Building2 className="w-12 h-12 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-black text-zinc-50 mb-3 relative z-10">Compte lié</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed relative z-10">
              Votre compte de retrait est configuré. Pour des raisons de sécurité, vous ne pouvez pas le modifier vous-même.
            </p>
            
            <div className="bg-zinc-800/50 p-5 rounded-2xl text-left border border-zinc-700/50 mb-8 relative z-10">
              <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-3">Détails actuels</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-700/50">
                   <span className="text-zinc-400 font-medium text-sm">Opérateur</span>
                   <span className="text-zinc-50 font-bold text-sm bg-zinc-700/50 px-2.5 py-1 rounded-lg">{method}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-zinc-400 font-medium text-sm">Numéro</span>
                   <span className="text-zinc-50 font-black text-sm tracking-widest">{accountNumber}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-xl font-bold transition-all shadow-sm relative z-10"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            <div className="bg-zinc-900 border border-zinc-800 shadow-2xl p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[30px] -mr-8 -mt-8 pointer-events-none"></div>
              
              <div className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                    Moyen de Paiement
                  </label>
                  <div className="bg-zinc-900 border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl transition-all duration-300">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-transparent border-none px-4 py-4 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none appearance-none"
                    >
                      <option value="" className="bg-zinc-900 text-zinc-400">Sélectionnez un moyen</option>
                      {(user?.country === "Cote d'Ivoire" || user?.country === "Côte d'Ivoire") && (
                        <>
                          <option value="ORANGE" className="bg-zinc-900">Orange Money</option>
                          <option value="MTN" className="bg-zinc-900">MTN Mobile Money</option>
                          <option value="MOOV" className="bg-zinc-900">Moov Money</option>
                          <option value="WAVE" className="bg-zinc-900">Wave</option>
                        </>
                      )}
                      {user?.country === "Togo" && (
                        <>
                          <option value="TMONEY" className="bg-zinc-900">TMoney</option>
                          <option value="MOOV" className="bg-zinc-900">Moov Money</option>
                        </>
                      )}
                      {(user?.country === "Bénin" || user?.country === "Benin") && (
                        <>
                          <option value="MTN" className="bg-zinc-900">MTN Mobile Money</option>
                          <option value="MOOV" className="bg-zinc-900">Moov Money</option>
                          <option value="CELTIIS" className="bg-zinc-900">Celtiis Cash</option>
                        </>
                      )}
                      {(user?.country === "Burkina" || user?.country === "Burkina Faso") && (
                        <>
                          <option value="ORANGE" className="bg-zinc-900">Orange Money</option>
                          <option value="MOOV" className="bg-zinc-900">Moov Money</option>
                        </>
                      )}
                      {user?.country === "Cameroun" && (
                        <>
                          <option value="ORANGE" className="bg-zinc-900">Orange Money</option>
                          <option value="MTN" className="bg-zinc-900">MTN Mobile Money</option>
                        </>
                      )}
                      {user?.country === "Niger" && (
                        <>
                          <option value="AIRTEL" className="bg-zinc-900">Airtel Money</option>
                          <option value="MOOV" className="bg-zinc-900">Moov Money</option>
                          <option value="ZAMANI" className="bg-zinc-900">Zamani Cash</option>
                          <option value="AL_IZZA" className="bg-zinc-900">Al Izza</option>
                          <option value="NITA" className="bg-zinc-900">Nita</option>
                          <option value="MYNITA" className="bg-zinc-900">MyNita</option>
                          <option value="AMANATA" className="bg-zinc-900">Amanata</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                      Numéro de compte / mobile
                   </label>
                   <div className="relative bg-zinc-900 border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl transition-all duration-300">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">#</span>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Ex: 0102030405"
                        className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none placeholder-zinc-700"
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                      Nom sur le compte
                   </label>
                   <div className="bg-zinc-900 border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl transition-all duration-300">
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Ex: Jean Dupont"
                        className="w-full bg-transparent border-none px-4 py-4 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none placeholder-zinc-700"
                        required
                      />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 relative z-10 shadow-lg">
               <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 px-1 mb-3">
                  Sécurité requise
               </label>
               <div className="bg-zinc-900 border-2 border-zinc-800 focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl transition-all duration-300">
                 <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none px-4 py-4 text-zinc-50 font-black focus:ring-0 outline-none placeholder-zinc-700 tracking-widest"
                 />
               </div>
               <p className="text-zinc-500 text-[11px] mt-3 font-medium px-1 leading-relaxed">Veuillez entrer le mot de passe de votre compte pour confirmer les informations de paiement.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving || !method || !accountNumber || !password}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {isSaving ? "Sauvegarde en cours..." : "Confirmer le compte"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
