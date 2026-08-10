import React, { useState, useEffect } from 'react';
import { CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Proofs() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('id, amount, created_at, reference, users(phone)')
          .eq('type', 'withdrawal')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (data) {
          setProofs(data);
        }
      } catch (error) {
        console.error("Error fetching proofs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
  };

  const getNetworkColor = (network: string) => {
    if (!network) return 'text-emerald-500 bg-emerald-50';
    const lower = network.toLowerCase();
    if (lower.includes('orange')) return 'text-orange-500 bg-orange-50';
    if (lower.includes('mtn')) return 'text-yellow-500 bg-yellow-50';
    if (lower.includes('moov')) return 'text-blue-500 bg-blue-50';
    if (lower.includes('wave')) return 'text-cyan-500 bg-cyan-50';
    return 'text-emerald-500 bg-emerald-50';
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '00 00 ** ** 00';
    const clean = phone.replace(/\s/g, '');
    if (clean.length < 8) return phone;
    return clean.substring(0, 4) + ' ** ** ' + clean.substring(clean.length - 2);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
  };

  return (
    <div className="px-4 pt-4 pb-32 min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shadow-inner">
          <ImageIcon className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Preuves de Paiement</h1>
          <p className="text-slate-500 text-sm font-medium">Transparence et fiabilité</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">0709789499</p>
            <p className="text-slate-500 text-[11px] font-medium">Témoignage</p>
          </div>
        </div>
        <p className="text-slate-700 text-sm font-medium italic mb-3">
          "J'ai reçu mon dépôt et je pense que cette plateforme est là meilleure."
        </p>
        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
          <img src="https://i.imgur.com/XeHMi9O.jpeg" alt="Preuve de dépôt" className="w-full h-auto object-cover max-h-64 rounded-xl" />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : proofs.length > 0 ? (
          <div className="absolute inset-0 overflow-y-auto hide-scrollbar pb-32">
            <div className="space-y-3 flex flex-col">
              {proofs.map((proof, idx) => {
                let network = 'Mobile Money';
                if (proof.reference && proof.reference.includes('orange')) network = 'Orange Money';
                else if (proof.reference && proof.reference.includes('mtn')) network = 'MTN Mobile Money';
                else if (proof.reference && proof.reference.includes('moov')) network = 'Moov Money';
                else if (proof.reference && proof.reference.includes('wave')) network = 'Wave';
                
                const phone = proof.users?.phone || '';
                
                return (
                  <div
                    key={`${proof.id}-${idx}`}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNetworkColor(network)}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{maskPhone(phone)}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{getTimeAgo(proof.created_at)} • {network}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-sm">{formatCurrency(proof.amount)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Succès</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <ImageIcon className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aucune preuve pour le moment</h2>
            <p className="text-slate-500 text-sm">
              Les preuves de paiement apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
