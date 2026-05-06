import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, Phone, ArrowRight, Wallet, Copy, Zap } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Deposit() {
  const [ussdCodes, setUssdCodes] = useState({ ci: '*155*1*1*0140814162#', mtn_ci: '*133*1*1*0595918513#' });
  const [waveNum, setWaveNum] = useState('0574738155');

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['ussd_ci', 'wave_number', 'ussd_mtn_ci']).then(({ data }) => {
      if (data) {
        setUssdCodes(prev => ({
          ci: data.find(s => s.key === 'ussd_ci')?.value || prev.ci,
          mtn_ci: data.find(s => s.key === 'ussd_mtn_ci')?.value || prev.mtn_ci,
        }));
        setWaveNum(data.find(s => s.key === 'wave_number')?.value || '0574738155');
      }
    });
  }, []);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const country = "Cote d'Ivoire"; // Default and only allowed country
  const [method, setMethod] = useState<'wave' | 'mtn' | 'moov'>('wave');
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 2500) {
      setError('Le montant minimum de financement est de 2500 FCFA.');
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
      
      if (method === 'moov' || method === 'mtn') {
        let ussd = method === 'moov' ? ussdCodes.ci : ussdCodes.mtn_ci;

        let finalUssd = ussd;
        if (finalUssd.includes('#')) {
            finalUssd = finalUssd.replace('#', `*${amount}#`);
        } else {
            finalUssd = `${finalUssd}*${amount}#`;
        }

        setUssdCode(finalUssd);
        
        let baseUssd = finalUssd;
        
        const telUrl = `tel:${baseUssd.replace('#', '%23')}`;
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
      setError('Une erreur est survenue lors de la création du financement.');
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
           <h1 className="text-2xl font-black text-white tracking-tight">Financement</h1>
           <p className="text-amber-500 text-[10px] uppercase font-bold tracking-widest">Recharger le capital</p>
        </div>
      </header>

      <div className="relative z-10 max-w-lg mx-auto">
      {step === 2 ? (
         <div className="bg-[#111] rounded-[2rem] p-6 text-center shadow-2xl border border-white/5 mt-4 animate-in fade-in duration-300">
           <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/20">
             <CheckCircle2 className="w-12 h-12 text-green-500" />
           </div>
           
           <h2 className="text-2xl font-black text-white mb-2">Demande Validée</h2>
           <p className="text-gray-400 mb-6 font-medium text-sm">Le réseau a enregistré votre demande d'ajout de <span className="text-amber-500 font-black">{formatCurrency(Number(amount))}</span>.</p>
           
           <div className="w-full h-px bg-white/5 mb-6"></div>

           {(method === 'moov' || method === 'mtn') && (
              <div className="mb-8 text-left">
                <p className="text-sm font-bold text-white mb-3 text-center uppercase tracking-wider flex items-center justify-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500" />
                   Action Sécurisée
                </p>
                <p className="text-sm text-gray-400 mb-4 text-center">Le code a été exécuté sur votre téléphone. Si rien ne se passe, relancez ci-dessous :</p>
                
                <a href={`tel:${ussdCode.replace('#', '%23')}`} className={`flex items-center justify-center gap-2 w-full py-4 font-black rounded-xl mb-4 transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95 ${method === 'mtn' ? 'bg-[#FFCC00] hover:bg-[#ffe066] text-black' : 'bg-[#FF7900] hover:bg-[#ff9433] text-white'}`}>
                  <Phone className="w-5 h-5" />
                  Initialiser le Transfert
                </a>
              </div>
           )}



           {method === 'wave' && (
              <div className="mb-8 text-left bg-[#1C3FB7]/10 border border-[#1C3FB7]/20 p-5 rounded-[1.5rem]">
                 <p className="font-black text-[#608bfa] mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                   <Zap className="w-4 h-4" /> Protocole Wave
                 </p>
                 <div className="space-y-4 text-sm text-[#8caeff] font-medium">
                   <p className="flex items-center gap-3">
                     <span className="bg-[#1C3FB7]/20 border border-[#1C3FB7]/30 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-inner">1</span>
                     <span>Ouvrir l'application Wave.</span>
                   </p>
                   <p className="flex items-center gap-3">
                     <span className="bg-[#1C3FB7]/20 border border-[#1C3FB7]/30 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-inner">2</span>
                     <span>Transférer le montant de <strong className="text-white">{formatCurrency(Number(amount))}</strong> au destinataire suivant :</span>
                   </p>
                   
                   <div className="ml-9 my-3 bg-[#111] p-4 rounded-2xl border border-white/5 shadow-inner flex items-center justify-between">
                      <div>
                        <p className="text-xl font-black text-white tracking-widest leading-none drop-shadow-md">{waveNum}</p>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">Soleil-Power Network</p>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="p-3 bg-[#1a1a1a] hover:bg-white/5 rounded-xl text-amber-500 transition-colors border border-white/5 shadow-sm active:scale-95"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                   </div>
                   
                   
                 </div>
              </div>
           )}

           <button onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] hover:bg-white/10 text-white font-black py-4 rounded-xl transition-all shadow-lg border border-white/5 active:scale-95">
             Voir l'historique d'injection
             <ArrowRight className="w-5 h-5" />
           </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] p-5 rounded-3xl shadow-2xl border border-white/5 flex items-center justify-between mb-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Puissance Actuelle</p>
               <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(user?.balance || 0)}</p>
             </div>
             <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
               <Wallet className="w-7 h-7 text-amber-500" />
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Info className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
             
             <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Moyen de paiement</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'moov' | 'wave' | 'mtn')}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white mt-1 appearance-none outline-none"
                required
              >
                <option value="wave" className="bg-[#111] text-white">Wave</option>
                <option value="moov" className="bg-[#111] text-white">Moov Money</option>
                <option value="mtn" className="bg-[#111] text-white">MTN Mobile Money</option>
              </select>
            </div>

            <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Numéro de source</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white placeholder-gray-600 mt-1 outline-none tracking-wider"
                placeholder={country === "Cote d'Ivoire" ? "0102030405" : "Numéro"}
                required
              />
            </div>
            
            <div className="px-5 py-5 bg-[#0a0a0a]/50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Volume à injecter</label>
              <div className="flex items-center mt-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-4xl font-black text-amber-500 placeholder-amber-500/30 outline-none"
                  placeholder="2500"
                  required
                  min="2500"
                />
                <span className="text-gray-400 font-black ml-2 text-xl tracking-tighter">XOF</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 flex items-center justify-center gap-2 mt-8"
          >
            {loading ? 'Calcul...' : 'Lancer le Puits de Charge'}
            {!loading && <ArrowRight className="w-6 h-6" />}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
