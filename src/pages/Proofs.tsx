import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

export function Proofs() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          setProofs([]);
        } else {
          console.error(error);
        }
      } else if (data) {
        setProofs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-32 min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shadow-inner">
          <ImageIcon className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Preuves</h1>
          <p className="text-slate-500 text-sm font-medium">Témoignages et paiements</p>
        </div>
      </div>

      <div className="flex-1 relative overflow-y-auto pr-2 pb-32 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : proofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <ImageIcon className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aucune preuve pour le moment</h2>
            <p className="text-slate-500 text-sm">
              Les preuves de paiement apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {proofs.map((proof, idx) => (
              <motion.div 
                key={proof.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
              >
                <div className="relative w-full bg-slate-100">
                  <img src={proof.image_url} alt="Preuve" className="w-full h-auto object-cover max-h-80" />
                </div>
                {proof.testimonial && (
                  <div className="p-5">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                         <MessageCircle className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium italic text-sm leading-relaxed">
                          "{proof.testimonial}"
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          {format(new Date(proof.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
