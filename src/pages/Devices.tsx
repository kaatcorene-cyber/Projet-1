import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Cpu, Activity, Clock, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Devices() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDevices();
  }, [user]);

  const fetchDevices = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('start_date', { ascending: false });
    
    if (data) setDevices(data);
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 flex flex-col font-sans relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <header className="px-5 pt-8 pb-4 border-b border-neutral-200 bg-white/80 backdrop-blur-xl rounded-none rounded-b-3xl mb-4 flex items-center justify-between relative z-10 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg text-neutral-900">Mes Appareils</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-5 pt-8 pb-20 max-w-md mx-auto w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-white border border-neutral-100 shadow-sm ring-4 ring-neutral-50 rounded-2xl flex items-center justify-center text-neutral-500">
              <Cpu className="w-6 h-6 text-brand" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-neutral-900">Actifs en cours</h1>
              <p className="text-neutral-500 text-sm font-medium">{devices.length} machine(s) connectée(s)</p>
           </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="w-8 h-8 text-neutral-400 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center shadow-sm">
            <Cpu className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-500 mb-4">Aucun appareil actif</p>
            <button onClick={() => navigate('/invest')} className="px-6 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-[#c40828] transition-colors shadow-[0_4px_14px_0_rgba(229,9,47,0.39)]">
              Boutique
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => {
               const start = new Date(device.start_date);
               const end = new Date(device.end_date);
               const progress = Math.min(100, Math.max(0, ((Date.now() - start.getTime()) / (end.getTime() - start.getTime())) * 100));

               return (
                 <motion.div 
                   key={device.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white border border-neutral-200 shadow-sm rounded-[24px] p-6 hover:shadow-md transition-shadow"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1 flex items-center gap-1">
                             <Zap className="w-3 h-3 fill-current" /> En Service
                          </p>
                          <p className="text-lg font-black text-neutral-900">{formatCurrency(device.plan_amount)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Revenu journalier</p>
                          <p className="text-sm font-black text-brand">+{formatCurrency(device.daily_yield)}</p>
                       </div>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-2 mb-3 overflow-hidden border border-neutral-200 shadow-inner">
                       <div className="bg-brand h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                       <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(start, 'dd MMM', { locale: fr })}
                       </span>
                       <span>
                          Fin: {format(end, 'dd MMM', { locale: fr })}
                       </span>
                    </div>
                 </motion.div>
               );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
