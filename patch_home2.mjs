import fs from 'fs';

let content = `
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, Info, ArrowDownToLine, Gift, Key, Zap, Clock , Smartphone, Download, Package, ShieldCheck, TrendingUp, Leaf, X , Share , PlusSquare , Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_IMAGES = [
  "https://i.imgur.com/is3THCW.jpeg",
  "https://i.imgur.com/KtjtZav.jpeg",
  "https://i.imgur.com/HcluyH6.jpeg",
  "https://i.imgur.com/HmsMVSu.jpeg"
];

export function Home() {
  const { user, setUser } = useAuthStore();
  const { config } = useAppStore();
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const closeJoinModal = () => {
    setShowJoinModal(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 pt-4 pb-32 min-h-[100dvh] font-sans relative overflow-hidden">
      
      <AnimatePresence>
        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full flex flex-col shadow-2xl relative"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-4">Bienvenue sur ElevFinAi</h2>
                <p className="text-slate-600 text-[15px] font-medium mb-8 leading-relaxed">
                  Votre plateforme dédiée à l'investissement dans le secteur de l'élevage en Côte d'Ivoire. Découvrez nos différentes opportunités (Aviculture, Pisciculture, etc.) et participez activement au développement de l'agriculture locale tout en générant des revenus passifs sécurisés.
                </p>
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-[#0088cc] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 active:scale-95 transition-transform"
                  >
                    Rejoindre notre communauté Telegram
                  </a>
                  <button 
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-[350px] rounded-3xl overflow-hidden mb-6 shadow-md border border-slate-200/20">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={BANNER_IMAGES[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-end">
           <div className="flex gap-1.5">
             {BANNER_IMAGES.map((_, i) => (
               <div key={i} className={\`h-1.5 rounded-full transition-all duration-300 \${i === currentSlide ? 'w-4 bg-brand-500' : 'w-1.5 bg-white/50'}\`} />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Home.tsx', content);
