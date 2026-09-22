import fs from 'fs';

const depositCode = `import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(user?.country || "Cote d'Ivoire");
  const [method, setMethod] = useState<'moov' | 'wave'>('moov');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Default to first available method when changing country
  useEffect(() => {
    if (country === 'Togo') {
      setMethod('moov');
    } else {
      setMethod('moov'); // Both CI and BF have Moov and Wave, default to moov
    }
  }, [country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 1000) {
      setError('Le montant minimum de dépôt est de 1000 FCFA.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: \`\${method.toUpperCase()} - \${phone}\`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      // Handle the actions
      if (method === 'moov') {
        let ussd = '';
        if (country === 'Togo') ussd = '*155*1*2*1*3*2250140814162#';
        else if (country === "Cote d'Ivoire") ussd = '*155*1*1*0140814162#';
        else if (country === 'Burkina Faso') ussd = '*555*1*2*1*1*2250140814162#';
        
        // redirect to USSD
        setSuccessMsg('Redirection vers USSD...');
        setTimeout(() => {
          window.location.href = \`tel:\${ussd.replace('#', '%23')}\`;
          navigate('/history');
        }, 1500);
      } else {
        // Wave
        setSuccessMsg('Votre demande de dépôt est enregistrée. Veuillez effectuer le transfert via votre application Wave.');
        setTimeout(() => {
          navigate('/history');
        }, 3000);
      }

    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 pt-16 pb-24 font-sans">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recharger</h1>
      </header>

      {successMsg ? (
         <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
           <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée</h2>
           <p className="text-gray-500">{successMsg}</p>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-1">
             <div className="px-3 py-2 border-b border-gray-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pays</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 mt-1 appearance-none"
                required
              >
                <option value="Cote d'Ivoire">Côte d'Ivoire</option>
                <option value="Togo">Togo</option>
                <option value="Burkina Faso">Burkina Faso</option>
              </select>
            </div>
            
             <div className="px-3 py-2 border-b border-gray-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Moyen de paiement</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'moov' | 'wave')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 mt-1 appearance-none"
                required
              >
                <option value="moov">Moov Money</option>
                {country !== 'Togo' && <option value="wave">Wave</option>}
              </select>
            </div>

            <div className="px-3 py-2 border-b border-gray-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Numéro de paiement</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
                placeholder="Votre numéro de téléphone"
                required
              />
            </div>
            <div className="px-3 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant (FCFA)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-300 mt-1"
                placeholder="Min: 1 000"
                required
                min="1000"
              />
            </div>
          </div>

          {method === 'wave' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-blue-900 mb-1">Instructions Wave</p>
                {country === 'Burkina Faso' && (
                  <p className="text-red-600 font-bold mb-2">Attention : Il s'agit d'un transfert vers la Côte d'Ivoire !</p>
                )}
                <p className="text-blue-800">1. Allez dans votre application Wave.</p>
                <p className="text-blue-800">2. Envoyez l'argent au numéro suivant :</p>
                <div className="mt-2 bg-white p-3 rounded-lg border border-blue-100 flex flex-col gap-1">
                   <span className="text-xl font-black text-gray-900">05 74 73 81 55</span>
                   <span className="text-sm font-bold text-gray-500">Nom : Qualcomm Entreprise</span>
                </div>
                <p className="text-blue-800 mt-2">Puis cliquez sur Payer maintenant.</p>
              </div>
            </div>
          )}
          
          {method === 'moov' && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-bold mb-1">Processus Moov Money</p>
                <p>En cliquant sur payer, vous serez redirigé vers l'application téléphone pour composer le code USSD automatiquement.</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            {loading ? 'Traitement...' : 'Payer maintenant'}
          </button>
        </form>
      )}
    </div>
  );
}
\`;

fs.writeFileSync('src/pages/Deposit.tsx', depositCode);
`;
fs.writeFileSync('patch_deposit.js', depositCode);
