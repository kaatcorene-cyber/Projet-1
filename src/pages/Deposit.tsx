import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, Phone, ArrowRight, Wallet, Copy } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const [ussdCodes, setUssdCodes] = useState({ togo: '*155*1*2*1*3*2250140814162#', ci: '*155*1*1*0140814162#', bf: '*555*1*2*1*1*2250140814162#', benin: '*155*1*2*1*2*2250140814162#' });
  const [waveNum, setWaveNum] = useState('0574738155');

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['ussd_togo', 'ussd_ci', 'ussd_bf', 'ussd_benin', 'wave_number']).then(({ data }) => {
      if (data) {
        setUssdCodes(prev => ({
          togo: data.find(s => s.key === 'ussd_togo')?.value || prev.togo,
          ci: data.find(s => s.key === 'ussd_ci')?.value || prev.ci,
          bf: data.find(s => s.key === 'ussd_bf')?.value || prev.bf,
          benin: data.find(s => s.key === 'ussd_benin')?.value || prev.benin,
        }));
        setWaveNum(data.find(s => s.key === 'wave_number')?.value || '0574738155');
      }
    });
  }, []);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const country = user?.country || "Cote d'Ivoire";
  const [method, setMethod] = useState<'moov' | 'wave'>('moov');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(waveNum.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const [step, setStep] = useState<1 | 2>(1);
  const [ussdCode, setUssdCode] = useState('');

  useEffect(() => {
    if (country === 'Togo' || country === 'Benin') {
      setMethod('moov');
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
        reference: `${method.toUpperCase()} - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      if (method === 'moov') {
        let ussd = '';
        if (country === 'Togo') ussd = ussdCodes.togo;
        else if (country === "Cote d'Ivoire") ussd = ussdCodes.ci;
        else if (country === 'Burkina Faso') ussd = ussdCodes.bf;
        else if (country === 'Benin') ussd = ussdCodes.benin;
        setUssdCode(ussd);
        
        const telUrl = `tel:${ussd.replace('#', '%23')}`;
        const a = document.createElement('a');
        a.href = telUrl;
        a.target = '_top';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setStep(2);
      } else {
        setStep(2);
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

      {step === 2 ? (
         <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100 mt-4 animate-in fade-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <CheckCircle2 className="w-10 h-10 text-green-500" />
           </div>
           
           <h2 className="text-2xl font-black text-gray-900 mb-2">Demande enregistrée</h2>
           <p className="text-gray-500 mb-6 font-medium">Votre demande de dépôt de <span className="text-gray-900 font-black">{formatCurrency(Number(amount))}</span> est bien notée.</p>
           
           <div className="w-full h-px bg-gray-100 mb-6"></div>

           {method === 'moov' && (
              <div className="mb-8 text-left">
                <p className="text-sm font-bold text-gray-900 mb-3 text-center uppercase tracking-wider">Action Requise</p>
                <p className="text-sm text-gray-500 mb-4 text-center">Le code secret de paiement s'est ouvert sur votre téléphone, ou cliquez sur le bouton ci-dessous pour le relancer :</p>
                
                <a href={`tel:${ussdCode.replace('#', '%23')}`} className="flex items-center justify-center gap-2 w-full py-4 bg-[#FF7900] hover:bg-[#FF7900]/90 text-white font-bold rounded-xl mb-4 transition-all shadow-md shadow-orange-200 active:scale-95">
                  <Phone className="w-5 h-5" />
                  Lancer le code USSD
                </a>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wider">Ou tapez manuellement :</p>
                  <p className="font-mono font-black text-gray-900 text-lg tracking-wider">{ussdCode}</p>
                </div>
              </div>
           )}

           {method === 'wave' && (
              <div className="mb-8 text-left bg-[#F1F6FF] border border-[#D5E4FF] p-5 rounded-xl">
                 <p className="font-black text-[#1C3FB7] mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                   <Info className="w-4 h-4" /> Instructions Wave
                 </p>
                 <div className="space-y-3 text-sm text-[#1C3FB7] font-medium">
                   <p className="flex items-start gap-2">
                     <span className="bg-[#D5E4FF] text-[#1C3FB7] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5">1</span>
                     <span>Ouvrez votre application Wave.</span>
                   </p>
                   <p className="flex items-start gap-2">
                     <span className="bg-[#D5E4FF] text-[#1C3FB7] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5">2</span>
                     <span>Transférez exact. <strong className="text-gray-900">{formatCurrency(Number(amount))}</strong> au :</span>
                   </p>
                   
                   <div className="ml-7 my-3 bg-white p-3 rounded-xl border border-[#D5E4FF] shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xl font-black text-gray-900 tracking-widest leading-none">{waveNum}</p>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Qualcomm Entreprise</p>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Copier le numéro"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                   </div>
                   
                   {country === 'Burkina Faso' && (
                     <p className="text-red-700 font-bold bg-red-50 p-3 rounded-lg border border-red-100 text-center mt-2">
                       Attention: Transfert depuis le Burkina vers un compte Wave CI !
                     </p>
                   )}
                 </div>
              </div>
           )}

           <button onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-gray-200">
             Terminer et voir l'historique
             <ArrowRight className="w-5 h-5" />
           </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
               <Wallet className="w-6 h-6 text-red-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Solde Actuel</p>
               <p className="text-xl font-black text-gray-900">{formatCurrency(user?.balance || 0)}</p>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Info className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
             
             <div className="px-4 py-3 border-b border-gray-100">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Moyen de paiement</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'moov' | 'wave')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-black text-gray-900 mt-1 appearance-none outline-none"
                required
              >
                <option value="moov">Moov Money</option>
                {country !== 'Togo' && <option value="wave">Wave</option>}
              </select>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-black text-gray-900 placeholder-gray-300 mt-1 outline-none"
                placeholder={country === "Cote d'Ivoire" ? "Ex: 01 02 03 04 05" : "Entrez votre numéro"}
                required
              />
            </div>
            
            <div className="px-4 py-3 bg-gray-50/50">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Montant (FCFA)</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-2xl font-black text-red-600 placeholder-red-200 outline-none"
                  placeholder="1000"
                  required
                  min="1000"
                />
                <span className="text-gray-400 font-bold ml-2">XOF</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Création de la demande...' : 'Confirmer le dépôt'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium">Le système générera les instructions à l'étape suivante.</p>
        </form>
      )}
    </div>
  );
}
