import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, Phone, ArrowRight, Wallet, Copy } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AppLogo } from '../components/AppLogo';

export function Deposit() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      if (data) {
        const _s: Record<string, string> = {};
        data.forEach(d => _s[d.key] = d.value);
        setSettings(_s);
      }
    });
  }, []);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const country = "Cote d'Ivoire";
  const [method, setMethod] = useState<string>('wave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const allowedMethods = [
    { id: 'wave', label: 'Wave' },
    { id: 'moov', label: 'Moov Money' },
    { id: 'mtn', label: 'MTN Mobile Money' }
  ];

  const handleCopy = (txt: string) => {
    if(!txt) return;
    navigator.clipboard.writeText(txt.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const [step, setStep] = useState<1 | 2>(1);
  const [ussdCode, setUssdCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 1000) {
      setError('Le montant minimum de financement est de 1 000 FCFA.');
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
      
      let syntax = '';
      if (method === 'moov') syntax = settings['ussd_ci'] || '*155*1*1*0140814162#';
      if (method === 'mtn') syntax = settings['ussd_mtn_ci'] || '*133*1*1*0595918513#';

      if (syntax) {
        syntax = syntax.replace(/X/g, amount);
        setUssdCode(syntax);
      }
      setStep(2);
    } catch (err: any) {
      setError('Erreur lors de la création de la transaction.');
    } finally {
      setLoading(false);
    }
  };

  const getMethodNum = () => {
    if (method === 'wave') return settings['num_wave_ci'] || '0701020304';
    if (method === 'moov') return settings['num_moov_ci'] || '0140814162';
    if (method === 'mtn') return settings['num_mtn_ci'] || '0595918513';
    return '';
  };

  const getMethodName = () => {
    if (method === 'wave') return 'Wave';
    if (method === 'moov') return 'Moov Money';
    if (method === 'mtn') return 'MTN Mobile Money';
    return '';
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
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Financement</h1>
            <p className="text-emerald-600 text-[10px] uppercase font-bold tracking-wider">Recharge de Compte</p>
          </div>
        </div>
        <AppLogo imgClassName="h-7 w-auto object-contain max-h-9" />
      </header>

      <div className="relative z-10 max-w-lg mx-auto">
      {step === 2 ? (
         <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm text-center animate-in fade-in zoom-in duration-200">
           <div className="w-14 h-14 bg-emerald-50 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
           </div>
           
           <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Demande Enregistrée</h2>
           <p className="text-gray-500 text-xs mb-5 font-medium leading-relaxed">
             Pour finaliser votre dépôt de <strong className="text-emerald-700 font-bold">{formatCurrency(Number(amount))}</strong>, effectuez le transfert vers les coordonnées ci-dessous :
           </p>

           {(method === 'moov' || method === 'mtn') && (
              <div className="mb-4 text-left bg-gray-50 border border-black/5 p-4 rounded-2xl">
                 <div className="flex items-center justify-center gap-2 mb-3">
                    <p className="font-bold text-gray-900 text-sm">Paiement {getMethodName()}</p>
                 </div>
                 
                 <div className="space-y-3 text-xs text-gray-700 font-medium text-center">
                    <p className="text-xs">Numéro destinataire :</p>
                    <div className="bg-white border border-black/10 p-3 rounded-xl flex flex-col items-center justify-center">
                       <p className="text-xl font-black text-gray-900 tracking-wider leading-none mb-2">{getMethodNum()}</p>
                       <div className="w-full space-y-2">
                         <button 
                           onClick={() => handleCopy(getMethodNum())}
                           className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-xs font-bold"
                         >
                           {copied ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Copié</> : <><Copy className="w-4 h-4" /> Copier le numéro</>}
                         </button>
                         
                         {ussdCode && (
                           <a href={`tel:${ussdCode.replace('#', '%23')}`} className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-black rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm">
                             <Phone className="w-4 h-4" />
                             Payer via USSD
                           </a>
                         )}
                       </div>
                    </div>
                    <p className="text-[10px] text-gray-400">Votre solde sera crédité dès confirmation du transfert.</p>
                 </div>
              </div>
           )}

           {method === 'wave' && (
              <div className="mb-4 text-left bg-gray-50 border border-black/5 p-4 rounded-2xl">
                 <div className="flex items-center justify-center gap-2 mb-3">
                    <p className="font-bold text-[#1C3FB7] text-sm">Paiement Wave</p>
                 </div>
                 
                 <div className="space-y-3 text-xs text-gray-700 font-medium text-center">
                    <p className="text-xs">Ouvrez Wave et transférez sur le numéro :</p>
                    <div className="bg-white border border-black/10 p-3 rounded-xl flex flex-col items-center justify-center">
                       <p className="text-xl font-black text-[#1C3FB7] tracking-wider leading-none mb-2">{getMethodNum()}</p>
                       <button 
                         onClick={() => handleCopy(getMethodNum())}
                         className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1C3FB7] rounded-lg transition-colors text-xs font-bold"
                       >
                         {copied ? <><CheckCircle2 className="w-4 h-4 text-green-600" /> Copié</> : <><Copy className="w-4 h-4" /> Copier le numéro Wave</>}
                       </button>
                    </div>
                 </div>
              </div>
           )}

           <button onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-xs mt-3">
             Voir l'historique
             <ArrowRight className="w-4 h-4" />
           </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between">
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Solde Actuel</p>
               <p className="text-xl font-black text-gray-900">{formatCurrency(user?.balance || 0)}</p>
             </div>
             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-600">
               <Wallet className="w-5 h-5" />
             </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Moyen de paiement (Côte d'Ivoire)</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 mt-1 focus:outline-none focus:border-emerald-500"
                required
              >
                {allowedMethods.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Numéro de source</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 placeholder-gray-400 mt-1 focus:outline-none focus:border-emerald-500"
                placeholder="Votre numéro de paiement"
                required
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Montant à financer (FCFA)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-3 py-2.5 text-lg font-black text-emerald-600 placeholder-gray-300 mt-1 focus:outline-none focus:border-emerald-500"
                placeholder="1000"
                required
                min="1000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Valider le financement'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
