import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
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
    <div className="pt-4 pb-32 min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden">
      <div className="px-4 flex items-center gap-3 mb-6 shrink-0 relative z-10">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
          <ArrowDownRight className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Retraits Récents</h1>
          <p className="text-slate-500 text-sm font-medium">Preuves de paiement en temps réel</p>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : proofs.length === 0 ? (
          <div className="mx-4 flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm relative z-10">
            <ArrowDownRight className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun retrait pour le moment</h2>
            <p className="text-slate-500 text-sm">
              Les preuves de retrait apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[60vh] overflow-hidden mask-image-vertical">
            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: proofs.length * 4,
                repeat: Infinity,
              }}
              className="flex flex-col gap-4 px-4"
            >
              {/* Double the array for seamless infinite scroll */}
              {[...proofs, ...proofs].map((proof, idx) => (
                <div 
                  key={`${proof.id}-${idx}`} 
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                       <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-bold text-sm sm:text-base leading-snug">
                        {proof.testimonial}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                         {format(new Date(proof.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Effectué</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
      <style>{`
        .mask-image-vertical {
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}
