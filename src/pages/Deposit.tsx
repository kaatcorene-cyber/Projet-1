import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, Phone, ArrowRight, Wallet, Copy, Zap } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

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
  const country = user?.country || "Cote d'Ivoire";
  const [method, setMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Derive allowed methods based on country
  const getMethods = () => {
    switch (country) {
      case "Bénin": return [{ id: 'moov', label: 'Moov Money' }, { id: 'mtn', label: 'MTN Money' }];
      case "Burkina Faso": return [{ id: 'moov', label: 'Moov Money' }, { id: 'wave', label: 'Wave' }];
      case "Togo": return [{ id: 'moov', label: 'Moov Money' }];
      case "Sénégal": return [{ id: 'wave', label: 'Wave' }];
      case "Niger": return [{ id: 'wave', label: 'Wave' }];
      case "Mali": return [{ id: 'moov', label: 'Moov Money' }, { id: 'wave', label: 'Wave' }];
      case "Cote d'Ivoire":
      default: return [{ id: 'wave', label: 'Wave' }, { id: 'moov', label: 'Moov Money' }, { id: 'mtn', label: 'MTN Mobile Money' }];
    }
  };

  const allowedMethods = getMethods();

  useEffect(() => {
    if (allowedMethods.length > 0 && !allowedMethods.find(m => m.id === method)) {
      setMethod(allowedMethods[0].id);
    }
  }, [country, allowedMethods, method]);

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
      
      let syntax = '';
      if (country === "Cote d'Ivoire") {
          if (method === 'moov') syntax = settings['ussd_ci'] || '*155*1*1*0140814162#';
          if (method === 'mtn') syntax = settings['ussd_mtn_ci'] || '*133*1*1*0595918513#';
      } else if (country === "Bénin") {
          if (method === 'moov') syntax = settings['bj_moov_syntax'] || '';
          if (method === 'mtn') syntax = settings['bj_mtn_syntax'] || '';
      } else if (country === "Burkina Faso") {
          if (method === 'moov') syntax = settings['bf_moov_syntax'] || '';
      } else if (country === "Togo") {
          if (method === 'moov') syntax = settings['tg_moov_syntax'] || '';
      } else if (country === "Mali") {
          if (method === 'moov') syntax = settings['ml_moov_syntax'] || '';
      }

      if (method === 'moov' || method === 'mtn') {
        if (syntax) {
          let finalUssd = syntax;
          if (country === "Cote d'Ivoire") {
            if (finalUssd.includes('#')) {
                finalUssd = finalUssd.replace('#', `*${amount}#`);
            } else {
                finalUssd = `${finalUssd}*${amount}#`;
            }
          }
          setUssdCode(finalUssd);
          
          if (country === "Cote d'Ivoire") {
            const telUrl = `tel:${finalUssd.replace('#', '%23')}`;
            const a = document.createElement('a');
            a.href = telUrl;
            a.target = '_top';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }
      }
      setStep(2);

    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la création du financement.');
    } finally {
      setLoading(false);
    }
  };

  const getMethodNum = () => {
    if (country === "Cote d'Ivoire" && method === 'wave') return settings['wave_number'] || '0574738155';
    if (country === "Bénin" && method === 'moov') return settings['bj_moov_number'] || '';
    if (country === "Bénin" && method === 'mtn') return settings['bj_mtn_number'] || '';
    if (country === "Burkina Faso" && method === 'moov') return settings['bf_moov_number'] || '';
    if (country === "Burkina Faso" && method === 'wave') return settings['bf_wave_number'] || '';
    if (country === "Togo" && method === 'moov') return settings['tg_moov_number'] || '';
    if (country === "Sénégal" && method === 'wave') return settings['sn_wave_number'] || '';
    if (country === "Niger" && method === 'wave') return settings['ne_wave_number'] || '';
    if (country === "Mali" && method === 'moov') return settings['ml_moov_number'] || '';
    if (country === "Mali" && method === 'wave') return settings['ml_wave_number'] || '';
    return '0123456789';
  };

  const getMethodName = () => {
    if (method === 'wave') return 'Wave';
    if (method === 'moov') return 'Moov Money';
    if (method === 'mtn') return 'MTN Money';
    return '-';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-5 pt-16 pb-24 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
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
         <div className="bg-white rounded-[2rem] p-6 text-center shadow-xl border border-gray-100 mt-4 animate-in fade-in duration-300">
           <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-green-100">
             <CheckCircle2 className="w-8 h-8 text-green-500" />
           </div>
           
           <h2 className="text-xl font-black text-gray-900 mb-1">Demande Validée</h2>
           <p className="text-gray-500 mb-4 font-medium text-xs">Alerte de versement de <span className="text-amber-500 font-black">{formatCurrency(Number(amount))}</span> enregistrée.</p>
           
           <div className="w-full h-px bg-gray-100 mb-4"></div>

           {(method === 'moov' || method === 'mtn') && ussdCode && country === "Cote d'Ivoire" && (
              <div className="mb-4 text-left">
                <p className="text-xs font-bold text-gray-900 mb-2 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                   <Zap className="w-3 h-3 text-amber-500" />
                   Action Sécurisée
                </p>
                <p className="text-xs text-gray-500 mb-3 text-center">Le code a été exécuté. Si rien ne se passe, relancez :</p>
                
                <a href={`tel:${ussdCode.replace('#', '%23')}`} className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-black rounded-xl mb-4 transition-all shadow-md active:scale-95 ${method === 'mtn' ? 'bg-[#FFCC00] hover:bg-[#ffe066] text-black' : 'bg-[#FF7900] hover:bg-[#ff9433] text-white'}`}>
                  <Phone className="w-4 h-4" />
                  Initialiser le Transfert
                </a>
              </div>
           )}

           {((method === 'moov' || method === 'mtn') && (!ussdCode || country !== "Cote d'Ivoire")) && (
              <div className="mb-4 text-left bg-white border border-gray-100 p-4 rounded-[1.5rem] shadow-sm">
                 <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${method === 'mtn' ? 'bg-[#FFCC00]' : 'bg-[#FF7900]'}`}>
                      <Wallet className="w-4 h-4 text-black" />
                    </div>
                    <p className="font-bold text-gray-900 text-md">Paiement {getMethodName()}</p>
                 </div>
                 
                 <div className="space-y-4 text-sm text-gray-700 font-medium">
                   {country !== "Cote d'Ivoire" && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs shadow-sm text-center">
                       <p className="font-bold mb-1 flex items-center justify-center gap-1.5"><Info className="w-3 h-3 text-amber-600" /> Transfert International</p>
                       <p>Ceci est un transfert vers la Côte d'Ivoire. <strong>Veuillez saisir le numéro et le montant manuellement.</strong></p>
                     </div>
                   )}
                   
                   <div className="w-full text-center">
                     <p className="mb-2 text-xs">Copiez le numéro ci-dessous pour votre transfert de <strong className="text-black text-sm">{formatCurrency(Number(amount))}</strong> :</p>
                     <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Soleil-Power</p>
                        <p className="text-2xl font-black text-gray-900 tracking-wider leading-none mb-3 break-all">{getMethodNum()}</p>
                        <div className="w-full space-y-2">
                          <button 
                            onClick={() => handleCopy(getMethodNum())}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-gray-100 rounded-lg text-black border border-gray-200 transition-colors shadow-sm active:scale-95 text-xs font-bold"
                          >
                            {copied ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Numéro copié</> : <><Copy className="w-4 h-4" /> Copier le numéro</>}
                          </button>
                          
                          {ussdCode && (
                            <a href={`tel:${ussdCode.replace('#', '%23')}`} className={`flex items-center justify-center gap-2 w-full py-2 text-xs font-black rounded-lg transition-all shadow-sm active:scale-95 ${method === 'mtn' ? 'bg-[#FFCC00] hover:bg-[#ffe066] text-black' : 'bg-[#FF7900] hover:bg-[#ff9433] text-white'}`}>
                              <Phone className="w-4 h-4" />
                              Payer via USSD
                            </a>
                          )}
                        </div>
                     </div>
                   </div>
                   
                   {country === "Cote d'Ivoire" && (
                     <p className="text-center text-[10px] text-gray-500">Effectuez le transfert depuis votre application ou via USSD.</p>
                   )}
                 </div>
              </div>
           )}

           {method === 'wave' && (
              <div className="mb-4 text-left bg-white border border-gray-100 p-4 rounded-[1.5rem] shadow-sm">
                 <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1C3FB7] flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                    </div>
                    <p className="font-bold text-[#1C3FB7] text-md">Paiement Wave</p>
                 </div>
                 
                 <div className="space-y-4 text-sm text-gray-700 font-medium">
                   {country !== "Cote d'Ivoire" && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs shadow-sm text-center">
                       <p className="font-bold mb-1 flex items-center justify-center gap-1.5"><Info className="w-3 h-3 text-amber-600" /> Transfert International</p>
                       <p>Ceci est un transfert vers la Côte d'Ivoire. <strong>Veuillez saisir le numéro manuellement dans l'application.</strong></p>
                     </div>
                   )}
                   
                   <div className="w-full text-center">
                     <p className="mb-2 text-xs">Copiez le numéro ci-dessous pour votre transfert de <strong className="text-black text-sm">{formatCurrency(Number(amount))}</strong> :</p>
                     <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center shadow-inner overflow-hidden">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Soleil-Power</p>
                        <p className="text-2xl font-black text-[#1C3FB7] tracking-wider leading-none mb-3 break-all">{getMethodNum()}</p>
                        <button 
                          onClick={() => handleCopy(getMethodNum())}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-gray-100 rounded-lg text-[#1C3FB7] border border-gray-200 transition-colors shadow-sm active:scale-95 text-xs font-bold"
                        >
                          {copied ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Numéro copié</> : <><Copy className="w-4 h-4" /> Copier le numéro</>}
                        </button>
                     </div>
                   </div>
                 </div>
              </div>
           )}

           <button onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-4 rounded-xl transition-all shadow-sm active:scale-95">
             Voir l'historique d'injection
             <ArrowRight className="w-5 h-5" />
           </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] p-5 rounded-3xl shadow-2xl border border-white/5 flex items-center justify-between mb-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent -mr-16 -mt-16"></div>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Moyen de paiement ({country})</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white mt-1 appearance-none outline-none"
                required
              >
                {allowedMethods.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#111] text-white">{m.label}</option>
                ))}
              </select>
            </div>

            <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Numéro de source</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white placeholder-gray-600 mt-1 outline-none tracking-wider"
                placeholder="Numéro du compte"
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
