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
  const [country, setCountry] = useState<string>(user?.country || "Cote d'Ivoire");
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
          if (finalUssd.includes('#')) {
              finalUssd = finalUssd.replace('#', `*${amount}#`);
          } else {
              finalUssd = `${finalUssd}*${amount}#`;
          }
          setUssdCode(finalUssd);
          const telUrl = `tel:${finalUssd.replace('#', '%23')}`;
          const a = document.createElement('a');
          a.href = telUrl;
          a.target = '_top';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
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
         <div className="bg-[#111] rounded-[2rem] p-6 text-center shadow-2xl border border-white/5 mt-4 animate-in fade-in duration-300">
           <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/20">
             <CheckCircle2 className="w-12 h-12 text-green-500" />
           </div>
           
           <h2 className="text-2xl font-black text-white mb-2">Demande Validée</h2>
           <p className="text-gray-400 mb-6 font-medium text-sm">Le réseau a enregistré votre demande d'ajout de <span className="text-amber-500 font-black">{formatCurrency(Number(amount))}</span>.</p>
           
           <div className="w-full h-px bg-white/5 mb-6"></div>

           {(method === 'moov' || method === 'mtn') && ussdCode && (
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

           {((method === 'moov' || method === 'mtn') && !ussdCode) && (
              <div className="mb-8 text-left bg-white p-6 rounded-[1.5rem] shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${method === 'mtn' ? 'bg-[#FFCC00]' : 'bg-[#FF7900]'}`}>
                      <Wallet className="w-5 h-5 text-black" />
                    </div>
                    <p className="font-bold text-black text-lg">Paiement {getMethodName()}</p>
                 </div>
                 
                 <div className="space-y-5 text-sm text-gray-700 font-medium">
                   {country !== "Cote d'Ivoire" && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm mb-2 shadow-sm">
                       <p className="font-bold mb-1 flex items-center gap-1.5"><Info className="w-4 h-4 text-amber-600" /> Transfert International</p>
                       <p>Ceci est un transfert international vers la Côte d'Ivoire. Suivez les instructions de votre opérateur pour transférer vers un compte {getMethodName()} Ivoirien.</p>
                     </div>
                   )}
                   <div className="flex items-start gap-4">
                     <div className="bg-gray-100 text-gray-600 w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold mt-0.5">1</div>
                     <div className="w-full">
                       <p className="pt-1 mb-3">Transférez exactement <strong className="text-black text-base">{formatCurrency(Number(amount))}</strong> au numéro ci-dessous :</p>
                       <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-center justify-between shadow-sm overflow-hidden">
                          <div>
                            <p className="text-xl sm:text-2xl font-black text-black tracking-widest leading-none mb-1">{getMethodNum()}</p>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Soleil-Power</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(getMethodNum())}
                            className="p-3 bg-white hover:bg-gray-100 rounded-xl text-black border border-gray-200 transition-colors shadow-sm active:scale-95 flex items-center justify-center shrink-0"
                          >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
           )}

           {method === 'wave' && (
              <div className="mb-8 text-left bg-white p-6 rounded-[1.5rem] shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#1C3FB7] flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                    </div>
                    <p className="font-bold text-[#1C3FB7] text-lg">Paiement Wave</p>
                 </div>
                 
                 <div className="space-y-5 text-sm text-gray-700 font-medium">
                   {country !== "Cote d'Ivoire" && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm mb-2 shadow-sm">
                       <p className="font-bold mb-1 flex items-center gap-1.5"><Info className="w-4 h-4 text-amber-600" /> Transfert International</p>
                       <p>Ceci est un transfert international vers la Côte d'Ivoire. Suivez les instructions de l'application Wave pour transférer vers ce compte Ivoirien.</p>
                     </div>
                   )}
                   <div className="flex items-start gap-4">
                     <div className="bg-[#1C3FB7]/10 text-[#1C3FB7] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold mt-0.5">1</div>
                     <p className="pt-1">Ouvrez votre application Wave.</p>
                   </div>
                   <div className="flex items-start gap-4">
                     <div className="bg-[#1C3FB7]/10 text-[#1C3FB7] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold mt-0.5">2</div>
                     <div className="w-full">
                       <p className="pt-1 mb-3">Transférez exactement <strong className="text-black text-base">{formatCurrency(Number(amount))}</strong> au numéro ci-dessous :</p>
                       <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-center justify-between shadow-sm overflow-hidden">
                          <div>
                            <p className="text-xl sm:text-2xl font-black text-black tracking-widest leading-none mb-1">{getMethodNum()}</p>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Soleil-Power</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(getMethodNum())}
                            className="p-3 bg-white hover:bg-gray-100 rounded-xl text-[#1C3FB7] border border-gray-200 transition-colors shadow-sm active:scale-95 flex items-center justify-center shrink-0"
                          >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                       </div>
                     </div>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pays d'opération</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-white mt-1 appearance-none outline-none"
                required
              >
                <option value="Cote d'Ivoire">Côte d'Ivoire</option>
                <option value="Bénin">Bénin</option>
                <option value="Togo">Togo</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Niger">Niger</option>
                <option value="Mali">Mali</option>
                <option value="Sénégal">Sénégal</option>
              </select>
            </div>
             <div className="px-5 py-4 border-b border-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Moyen de paiement</label>
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
