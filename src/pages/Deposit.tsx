import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, CheckCircle2, Phone, Wallet, Copy, Shield, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
  const [method, setMethod] = useState<string>('wave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const allowedMethods = [
    { id: 'wave', label: 'Wave', color: 'text-blue-500' },
    { id: 'moov', label: 'Moov', color: 'text-orange-500' },
    { id: 'mtn', label: 'MTN', color: 'text-yellow-500' }
  ];

  const handleCopy = (txt: string) => {
    if(!txt) return;
    navigator.clipboard.writeText(txt.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const processPayment = async () => {
    if (Number(amount) < 1000) {
      setError('Le montant minimum est de 1000 FCFA.');
      return;
    }
    if (!phone || phone.length < 8) {
      setError('Veuillez entrer un numéro valide.');
      return;
    }
    setError('');

    if (method === 'wave' && step === 1) {
       setStep(2); // Go to Wave instructions
       return;
    }

    setLoading(true);

    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user?.id,
        type: 'deposit',
        amount: Number(amount),
        reference: `${method.toUpperCase()} - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      let syntax = '';
      if (method === 'moov') syntax = settings['ussd_ci'] || '*155*1*1*0140814162#';
      if (method === 'mtn') syntax = settings['ussd_mtn_ci'] || '*133*1*1*0595918513#';

      if (method === 'moov' || method === 'mtn') {
        if (syntax) {
            let finalUssd = syntax;
            if (finalUssd.includes('#')) {
                finalUssd = finalUssd.replace('#', `*${amount}#`);
            } else {
                finalUssd = `${finalUssd}*${amount}#`;
            }
            
            const telUrl = `tel:${finalUssd.replace('#', '%23')}`;
            const a = document.createElement('a');
            a.href = telUrl;
            a.target = '_top';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
      }
      setStep(3);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  const getMethodNum = () => {
    if (method === 'wave') return settings['wave_number'] || '0574738155';
    if (method === 'moov') return settings['moov_number'] || '0140814162';
    if (method === 'mtn') return settings['mtn_number'] || '0595918513';
    return '-';
  };

  const handleValidationWave = async () => {
    await processPayment();
  };

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 flex flex-col font-sans relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <header className="px-5 pt-8 pb-4 relative z-10 flex items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur-xl rounded-none rounded-b-3xl mb-4 shadow-sm">
        <button 
          onClick={() => step > 1 ? setStep(1) : navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg text-neutral-900">Dépôt</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 pt-6 pb-20 max-w-md mx-auto w-full relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mt-4 flex flex-col gap-4 px-2">
                
                <div className="bg-white rounded-2xl p-4 border border-neutral-200 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 shadow-sm relative group">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Montant du dépôt</label>
                  <div className="flex items-center gap-3">
                     <span className="text-neutral-900 font-black text-2xl">FCFA</span>
                     <input
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       className="w-full bg-transparent text-3xl font-black outline-none placeholder-neutral-200 text-neutral-900"
                       placeholder="0"
                       min="1000"
                       autoFocus
                     />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm relative group focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Opérateur</label>
                  <div className="relative">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full appearance-none bg-transparent text-xl font-black outline-none text-neutral-900"
                    >
                      {allowedMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6 pointer-events-none" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200 transition-colors shadow-sm focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 relative group">
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block group-focus-within:text-brand transition-colors">Numéro de téléphone</label>
                  <div className="flex items-center gap-3">
                     <Phone className="w-6 h-6 text-neutral-300" />
                     <input
                       type="tel"
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full bg-transparent text-xl font-black outline-none placeholder-neutral-200 text-neutral-900 tracking-wide"
                       placeholder="0000000000"
                       maxLength={10}
                     />
                  </div>
                </div>

              </div>

              <div className="mt-8 px-2 pb-6">
                {error && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 text-brand text-sm font-bold rounded-2xl text-center">
                    {error}
                  </div>
                )}
                <button
                  onClick={processPayment}
                  disabled={loading || !amount || !phone}
                  className="w-full bg-brand text-white font-black uppercase tracking-wider py-5 rounded-2xl hover:bg-[#c40828] transition-colors disabled:opacity-50 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] disabled:shadow-none"
                >
                  {loading ? 'Traitement...' : 'Payer maintenant'}
                </button>
                <p className="text-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-center gap-1 mt-4">
                   <Shield className="w-3 h-3" /> Paiement Sécurisé
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 mt-auto relative border border-neutral-200 shadow-sm"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full border border-neutral-100 shadow-xl flex items-center justify-center ring-4 ring-neutral-50">
                 <img src="https://play-lh.googleusercontent.com/1O8z_HnIyls-k7E3KCH78fF3y8OaL1j5Rkmb9LzE7vO_O5d8K6fJ0yD_Kj-3E2A" alt="Wave" className="w-12 h-12 rounded-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              
              <div className="pt-12 pb-4 text-center">
                <h2 className="text-2xl font-black mb-1 text-neutral-900">Paiement Wave</h2>
                <p className="text-sm font-bold text-neutral-500">Transfert de {formatCurrency(Number(amount))}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex flex-col items-center justify-center pb-6 shadow-inner">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 mt-2">Numéro à qui envoyer</p>
                  <p className="text-3xl font-black text-brand tracking-tight">{getMethodNum()}</p>
                </div>

                <button
                  onClick={() => handleCopy(getMethodNum())}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-4 rounded-xl text-sm font-bold border border-neutral-200 hover:bg-neutral-200 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-neutral-900" /> : <Copy className="w-5 h-5 text-neutral-500" />}
                  {copied ? 'Copié !' : 'Copier le numéro'}
                </button>
              </div>

              <div className="bg-neutral-50 text-neutral-600 p-4 rounded-xl text-xs font-medium leading-relaxed mb-6 border border-neutral-200 text-center">
                L'envoi doit se faire depuis le numéro <strong className="font-bold text-neutral-900">{phone}</strong> avec les frais inclus.
              </div>

              <button
                onClick={handleValidationWave}
                disabled={loading}
                className="w-full bg-brand text-white font-bold uppercase tracking-wider py-5 rounded-2xl hover:bg-[#c40828] transition-colors disabled:opacity-50 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)]"
              >
                {loading ? 'Traitement...' : 'J\'ai effectué le paiement'}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm text-center mt-auto"
            >
              <div className="w-24 h-24 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neutral-200">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-black mb-2 text-neutral-900">Demande Envoyée</h1>
              <p className="text-neutral-500 mb-8 font-medium">Votre dépôt de <span className="font-bold text-neutral-900">{formatCurrency(Number(amount))}</span> est en cours de traitement par notre système.</p>

              <button
                onClick={() => navigate('/history')}
                className="w-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-bold uppercase tracking-wider py-5 rounded-2xl hover:bg-neutral-200 transition-colors"
              >
                Voir mon historique
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
