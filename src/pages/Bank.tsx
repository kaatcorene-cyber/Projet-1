import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Save, CreditCard, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Bank() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [method, setMethod] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLinked, setIsLinked] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchBankDetails = async () => {
        const { data } = await supabase.from('users').select('bank_method, bank_account_name').eq('id', user.id).single();
        let bMethod = data?.bank_method;
        let bAccountName = data?.bank_account_name;
        
        // Fallback to localStorage if DB lacks the columns
        const localDataRaw = localStorage.getItem('bank_info_' + user.id);
        if (localDataRaw) {
          try {
             const localData = JSON.parse(localDataRaw);
             if (!bMethod && localData.bank_method) bMethod = localData.bank_method;
             if (!bAccountName && localData.bank_account_name) bAccountName = localData.bank_account_name;
          } catch(e) {}
        }
        
        if (bMethod || bAccountName) {
          if (bMethod) setMethod(bMethod);
          if (bAccountName) {
             const parts = bAccountName.split('|||');
             setAccountName(parts[0] || '');
             if (parts.length > 1) {
                setAccountNumber(parts[1] || '');
             }
          }
          
          if (bMethod && bAccountName && bAccountName.includes('|||')) {
            setIsLinked(true);
          }
        }
      };
      fetchBankDetails();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !accountName || !accountNumber || !password) {
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
      
      const packedName = `${accountName}|||${accountNumber}`;

      const { error } = await supabase.from('users').update({ 
        bank_method: method, 
        bank_account_name: packedName
      }).eq('id', user?.id);
      
      // Toujours enregistrer dans le localStorage comme fallback
      localStorage.setItem('bank_info_' + user?.id, JSON.stringify({ bank_method: method, bank_account_name: packedName }));

      if (error && error.code !== 'PGRST204') {
         throw error;
      }
      
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
    <div className="min-h-screen bg-transparent pb-24 font-sans animate-fade-in text-gray-900">
      <header className="bg-white px-5 pt-16 pb-6 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div>
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Ma Banque</h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Gérer vos paiements</p>
        </div>
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
          <Building2 className="w-6 h-6" />
        </div>
      </header>

      <div className="px-5 mt-6 max-w-md mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
             {message.text}
          </div>
        )}

        {isLinked ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Compte déjà lié</h2>
            <p className="text-gray-500 text-sm mb-6">
              Votre compte de retrait est déjà configuré avec succès. Pour des raisons de sécurité, vous ne pouvez pas le modifier vous-même.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-6 font-medium text-gray-800">
              <p className="text-xs uppercase text-gray-400 font-bold mb-1">Détails actuels</p>
              <p className="mb-1"><span className="text-gray-500">Moyen :</span> {method}</p>
              <p className="mb-1"><span className="text-gray-500">Nom :</span> {accountName}</p>
              <p><span className="text-gray-500">Numéro :</span> {accountNumber}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold tracking-wide transition-all text-sm"
            >
              Retour
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                Moyen de Paiement
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="">Sélectionnez un moyen</option>
                {(user?.country === "Cote d'Ivoire" || user?.country === "Côte d'Ivoire") && (
                  <>
                    <option value="ORANGE">Orange Money</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="MOOV">Moov Money</option>
                    <option value="WAVE">Wave</option>
                  </>
                )}
                {user?.country === "Togo" && (
                  <>
                    <option value="TMONEY">TMoney</option>
                    <option value="MOOV">Moov Money</option>
                  </>
                )}
                {(user?.country === "Bénin" || user?.country === "Benin") && (
                  <>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="MOOV">Moov Money</option>
                    <option value="CELTIIS">Celtiis Cash</option>
                  </>
                )}
                {(user?.country === "Burkina" || user?.country === "Burkina Faso") && (
                  <>
                    <option value="ORANGE">Orange Money</option>
                    <option value="MOOV">Moov Money</option>
                  </>
                )}
                {user?.country === "Cameroun" && (
                  <>
                    <option value="ORANGE">Orange Money</option>
                    <option value="MTN">MTN Mobile Money</option>
                  </>
                )}
                {user?.country === "Niger" && (
                  <>
                    <option value="AIRTEL">Airtel Money</option>
                    <option value="MOOV">Moov Money</option>
                  </>
                )}
              </select>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  Nom complet sur le compte
               </label>
               <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium placeholder-gray-400"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  Numéro de compte / mobile
               </label>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ex: 0102030405"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium placeholder-gray-400"
                  />
               </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
               <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Confirmation (Mot de passe)
               </label>
               <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe de connexion"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium placeholder-gray-400"
               />
               <p className="text-gray-400 text-xs mt-2">Nécessaire pour sécuriser l'ajout de votre méthode de retrait.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mt-4"
            >
              {isSaving ? "Modification en cours..." : "Sauvegarder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
