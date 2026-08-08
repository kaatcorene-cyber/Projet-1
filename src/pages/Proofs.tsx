import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, TrendingUp, Image as ImageIcon } from 'lucide-react';

const MOCK_PROOFS = [
  { id: 1, phone: '07 59 ** ** 12', amount: 45000, date: 'Il y a 5 min', network: 'Orange Money' },
  { id: 2, phone: '05 44 ** ** 89', amount: 125000, date: 'Il y a 12 min', network: 'MTN Mobile Money' },
  { id: 3, phone: '01 02 ** ** 34', amount: 15000, date: 'Il y a 25 min', network: 'Moov Money' },
  { id: 4, phone: '07 78 ** ** 56', amount: 250000, date: 'Il y a 45 min', network: 'Orange Money' },
  { id: 5, phone: '05 89 ** ** 01', amount: 60000, date: 'Il y a 1 heure', network: 'MTN Mobile Money' },
  { id: 6, phone: '07 45 ** ** 77', amount: 35000, date: 'Il y a 2 heures', network: 'Wave' },
  { id: 7, phone: '01 55 ** ** 22', amount: 150000, date: 'Il y a 3 heures', network: 'Moov Money' },
  { id: 8, phone: '05 12 ** ** 99', amount: 85000, date: 'Il y a 4 heures', network: 'MTN Mobile Money' },
];

export function Proofs() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
  };

  const getNetworkColor = (network: string) => {
    if (network.includes('Orange')) return 'text-orange-500 bg-orange-50';
    if (network.includes('MTN')) return 'text-yellow-500 bg-yellow-50';
    if (network.includes('Moov')) return 'text-blue-500 bg-blue-50';
    if (network.includes('Wave')) return 'text-cyan-500 bg-cyan-50';
    return 'text-emerald-500 bg-emerald-50';
  };

  return (
    <div className="px-4 pt-4 pb-32 min-h-screen bg-slate-50 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shadow-inner">
          <ImageIcon className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Preuves de Paiement</h1>
          <p className="text-slate-500 text-sm font-medium">Transparence et fiabilité</p>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm mb-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-emerald-900 font-bold text-sm mb-1">Paiements Garantis</h2>
          <p className="text-emerald-700 text-xs leading-relaxed">
            Tous les retraits sont traités de manière automatique et sécurisée vers vos comptes Mobile Money. Voici les derniers retraits effectués par nos membres.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_PROOFS.map((proof, idx) => (
          <motion.div
            key={proof.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNetworkColor(proof.network)}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{proof.phone}</p>
                <p className="text-slate-500 text-[11px] font-medium">{proof.date} • {proof.network}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-emerald-600 text-sm">+{formatCurrency(proof.amount)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Succès</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
