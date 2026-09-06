import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const availableCardRegex = /<motion\.div key=\{idx\}.*?className="bg-white\/5 rounded-2xl overflow-hidden border border-white\/10 flex flex-col shadow-lg">[\s\S]*?<\/motion\.div>/g;

const newAvailableCard = `<motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
                   <img referrerPolicy="no-referrer" src={getPlanImage(plan.amount, idx)} alt="Plan" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start gap-2">
                     <div>
                       <h3 className="text-xl font-black text-white leading-tight tracking-tight">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                       <Clock className="w-3.5 h-3.5 text-white" />
                       <span className="text-white/90 font-bold text-xs">{plan.duration || 30} J</span>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex-1 flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
                    <span className="text-brand-400 font-black text-xs">{formatCurrency(plan.daily)}</span>
                 </div>
                 <div className="flex-1 flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
                    <span className="text-white font-black text-xs">{formatCurrency(plan.total)}</span>
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
                className={\`w-full py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 \${hasInsufficientBalance ? 'bg-white/5 text-blue-200/60 border border-white/10 active:scale-95' : 'bg-brand-500 text-white hover:bg-brand-400 active:scale-95 shadow-lg shadow-brand-500/20'}\`}
              >
                {loadingPlan === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Payer'}
              </button>
            </motion.div>`;

content = content.replace(availableCardRegex, newAvailableCard);
fs.writeFileSync('src/pages/Revenues.tsx', content);
