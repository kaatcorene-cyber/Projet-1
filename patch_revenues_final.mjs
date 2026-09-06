import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const newRender = `
  return (
    <div className="min-h-[100dvh] bg-[#03296c] p-5 pt-12 pb-32 font-sans text-white relative">
      
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={\`p-4 rounded-xl mb-6 flex items-center gap-3 border \${message.type === 'success' ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-red-50 text-red-600 border-red-200'}\`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      {/* PACKS DISPONIBLES (moved to top) */}
      <div className="max-w-md mx-auto space-y-4 mb-8">
        {activePlans.map((plan: any, idx: number) => {
          const hasInsufficientBalance = (user?.balance || 0) < plan.amount;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/10 rounded-[24px] p-5 border border-white/20 shadow-sm flex flex-col gap-5">
              <div className="flex gap-4 items-center">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
                   <img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start gap-2">
                     <div>
                       <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-wider mb-1 block">{getPlanName(plan.amount)}</span>
                       <h3 className="text-xl font-black text-white leading-tight">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                       <Clock className="w-3.5 h-3.5 text-blue-200/60" />
                       <span className="text-white/90 font-bold text-xs">{plan.duration || 30} J</span>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                 <div className="flex flex-col bg-[#03296c] p-3 rounded-2xl border border-white/10">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
                    <span className="text-brand-600 font-black text-sm">{formatCurrency(plan.daily)}</span>
                 </div>
                 <div className="flex flex-col bg-[#03296c] p-3 rounded-2xl border border-white/10">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
                    <span className="text-white font-black text-sm">{formatCurrency(plan.total)}</span>
                 </div>
              </div>

              <button
                onClick={() => {
                  if (hasInsufficientBalance) {
                    setMessage({ type: 'error', text: 'Votre solde est insuffisant pour payer ce pack.' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    handleInvest(plan, idx);
                  }
                }}
                disabled={loadingPlan === idx}
                className={\`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 \${hasInsufficientBalance ? 'bg-white/5 text-blue-200/60 border border-white/10 active:scale-95' : 'bg-brand-500 text-white hover:bg-brand-400 active:scale-95 shadow-lg shadow-brand-500/20'}\`}
              >
                {loadingPlan === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Payer'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* MES PACKS ACTIFS (moved to bottom) */}
      <div className="max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
             <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : investments.length === 0 ? null : (
          <AnimatePresence mode="popLayout">
            {investments.map((inv, index) => {
              const plan = plans.find((p: any) => Number(String(p.amount).replace(/\\D/g, '')) === Number(inv.plan_amount)) || {};
              return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CountdownTimer inv={inv} plan={plan} onRefresh={fetchProducts} />
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
`;

content = content.replace(/return \([\s\S]*\}\s*;\s*\}/, newRender);

fs.writeFileSync('src/pages/Revenues.tsx', content);
