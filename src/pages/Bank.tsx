import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { PiggyBank, Save, CreditCard, ChevronLeft } from 'lucide-react';
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
    const loadBankInfo = async () => {
      if (!user?.id) return;
      
      let finalMethod = (user as any)?.bank_method;
      let finalAccountName = (user as any)?.bank_account_name;
      
      if (!finalMethod || !finalAccountName) {
        // Fetch from settings as fallback
        const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'bank_' + user.id).single();
        if (settingData?.value) {
          try {
            const parsed = JSON.parse(settingData.value);
            finalMethod = parsed.bank_method;
            finalAccountName = parsed.bank_account_name;
          } catch(e) {}
        }
      }
      
      if (finalMethod) {
        setMethod(finalMethod);
      }
      
      if (finalAccountName && typeof finalAccountName === 'string') {
        setAccountName(finalAccountName.split('|||')[0] || '');
        if (finalAccountName.includes('|||')) {
           setAccountNumber(finalAccountName.split('|||')[1] || '');
        }
      }
      
      if (finalMethod && finalAccountName && typeof finalAccountName === 'string' && finalAccountName.includes('|||')) {
        setIsLinked(true);
      }
    };
    
    loadBankInfo();
  }, [user?.id]);

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
    <div className="min-h-screen bg-transparent p-5 pt-16 pb-24 font-sans text-zinc-50">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-transparent flex items-center justify-center text-zinc-400 hover:text-zinc-50 transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Caisse</h1>
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
          <div className="text-center relative pt-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 relative z-10">
              <PiggyBank className="w-10 h-10 text-red-500" />
            </div>
            
            <h2 className="text-xl font-black text-zinc-50 mb-3 relative z-10">Compte lié</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed relative z-10">
              Vos informations pour vos retraits ont été déjà configurées.
            </p>
            
            <div className="text-left mb-8 relative z-10 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                 <span className="text-zinc-500 font-medium text-sm">Opérateur</span>
                 <span className="text-zinc-50 font-bold text-sm">{method}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                 <span className="text-zinc-500 font-medium text-sm">Numéro</span>
                 <span className="text-zinc-50 font-black text-sm tracking-widest">{accountNumber}</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-4 py-4 border border-zinc-700 bg-transparent hover:text-zinc-50 text-zinc-300 rounded-xl font-bold transition-all"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                  Moyen de Paiement
                </label>
                <div className="bg-zinc-900/80 border border-zinc-800 focus-within:border-red-500 rounded-2xl transition-all duration-300 shadow-sm">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-transparent border-none px-4 py-3.5 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none appearance-none"
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

              <div className="space-y-2 pt-1">
                 <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Numéro de compte / mobile
                 </label>
                 <div className="relative bg-zinc-900/80 border border-zinc-800 focus-within:border-red-500 rounded-2xl transition-all duration-300 shadow-sm">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Ex: 0102030405"
                      className="w-full bg-transparent border-none px-4 py-3.5 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none placeholder-zinc-700"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2 pt-1">
                 <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Nom sur le compte
                 </label>
                 <div className="bg-zinc-900/80 border border-zinc-800 focus-within:border-red-500 rounded-2xl transition-all duration-300 shadow-sm">
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full bg-transparent border-none px-4 py-3.5 text-zinc-50 font-black tracking-wider focus:ring-0 outline-none placeholder-zinc-700"
                      required
                    />
                 </div>
              </div>
            </div>
            
            <div className="pt-4 relative z-10">
               <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 mb-2">
                  Sécurité requise
               </label>
               <div className="bg-zinc-900/80 border border-zinc-800 focus-within:border-red-500 rounded-2xl transition-all duration-300 shadow-sm">
                 <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none px-4 py-3.5 text-zinc-50 font-black focus:ring-0 outline-none placeholder-zinc-700 tracking-widest"
                 />
               </div>
               <p className="text-zinc-600 text-[11px] mt-2 font-medium px-1 leading-relaxed">Entrez le mot de passe de votre compte pour confirmer.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving || !method || !accountNumber || !password}
              className="w-full mt-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-zinc-50 transition-all py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 border border-red-500/50 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSaving ? "En cours..." : "Confirmer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
