import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import clsx from 'clsx';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'wave' | 'mtn' | 'moov'>('wave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [networksInfo, setNetworksInfo] = useState({
    wave: { number: '', name: '' },
    mtn: { number: '', name: '' },
    moov: { number: '', name: '' }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const wv = data.find(s => s.key === 'deposit_wave')?.value;
        const mt = data.find(s => s.key === 'deposit_mtn')?.value;
        const mv = data.find(s => s.key === 'deposit_moov')?.value;
        
        setNetworksInfo({
          wave: wv ? JSON.parse(wv) : { number: '', name: '' },
          mtn: mt ? JSON.parse(mt) : { number: '', name: '' },
          moov: mv ? JSON.parse(mv) : { number: '', name: '' }
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (Number(amount) < 2500) {
      setError('Le montant minimum de dépôt est de 2500 FCFA.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: `Depot ${network.toUpperCase()} - ${phone}`,
        status: 'pending'
      }]);

      if (txError) throw txError;
      
      setStep(2); // Go to instruction step
    } catch (err) {
      setError('Une erreur est survenue lors de la création du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier !');
  };

  const selectedNetworkInfo = networksInfo[network];

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Recharger le compte</h1>
      </header>

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Réseau de paiement</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setNetwork('wave')}
                className={clsx(
                  "py-3 rounded-xl font-bold text-sm transition-colors border-2",
                  network === 'wave' ? "bg-white text-blue-600 border-blue-500 shadow-lg" : "bg-white/10 text-white border-transparent hover:bg-white/20"
                )}
              >
                Wave
              </button>
              <button
                type="button"
                onClick={() => setNetwork('mtn')}
                className={clsx(
                  "py-3 rounded-xl font-bold text-sm transition-colors border-2",
                  network === 'mtn' ? "bg-white text-yellow-500 border-yellow-400 shadow-lg" : "bg-white/10 text-white border-transparent hover:bg-white/20"
                )}
              >
                MTN
              </button>
              <button
                type="button"
                onClick={() => setNetwork('moov')}
                className={clsx(
                  "py-3 rounded-xl font-bold text-sm transition-colors border-2",
                  network === 'moov' ? "bg-white text-orange-600 border-orange-500 shadow-lg" : "bg-white/10 text-white border-transparent hover:bg-white/20"
                )}
              >
                Moov
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Montant à recharger (FCFA)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              placeholder="Ex: 5000"
              required
              min="2500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 ml-1">Votre numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              placeholder="Ex: 0123456789"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-all duration-300 disabled:opacity-50 shadow-md active:scale-95"
          >
            {loading ? 'Création...' : 'Valider'}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in text-gray-900">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Demande enregistrée</h2>
            <p className="text-sm text-gray-500">
              Veuillez transférer exactement {formatCurrency(Number(amount))} sur le compte ci-dessous pour finaliser votre dépôt via {network.toUpperCase()}.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Numéro ({network.toUpperCase()})</p>
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200">
                <span className="font-mono text-lg font-bold text-gray-900">{selectedNetworkInfo?.number || 'Non configuré'}</span>
                <button onClick={() => copyToClipboard(selectedNetworkInfo?.number || '')} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Nom sur le compte</p>
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900">{selectedNetworkInfo?.name || 'Non configuré'}</span>
                <button onClick={() => copyToClipboard(selectedNetworkInfo?.name || '')} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-800 font-medium text-center">
              ⚠️ Votre compte sera rechargé automatiquement après vérification du transfert par nos agents.
            </p>
          </div>

          <button
            onClick={() => navigate('/history')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md active:scale-95"
          >
            J'ai effectué le dépôt
          </button>
        </div>
      )}
    </div>
  );
}
