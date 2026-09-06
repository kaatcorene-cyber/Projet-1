import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const activeCardRegex = /<div className="bg-white\/10 rounded-\[24px\] p-5 border border-white\/20 shadow-sm flex flex-col gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/g;

const newActiveCard = `<div className="bg-white/10 rounded-[24px] p-5 border border-white/20 shadow-sm flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
          <img referrerPolicy="no-referrer" src={getPlanImage(inv.plan_amount, inv.id)} alt="Plan" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif</span>
              <h3 className="text-xl font-black text-white leading-none">{formatCurrency(inv.plan_amount)}</h3>
            </div>
            <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-blue-200/60" />
              <span className="text-white/90 font-bold text-xs">{plan?.duration || 30} Jrs</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
         <div className="flex-1 flex flex-col bg-[#03296c] p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
            <span className="text-brand-400 font-black text-xs leading-none">{formatCurrency(inv.daily_yield)}</span>
         </div>
         <div className="flex-1 flex flex-col bg-[#03296c] p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
            <span className="text-white font-black text-xs leading-none">{formatCurrency(Number(inv.daily_yield) * (plan?.duration || 30))}</span>
         </div>
      </div>
      <div className="pt-2">
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-black text-xs hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Collecter mes gains'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 bg-[#03296c] p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center w-full">
               <span className="text-[10px] text-blue-200/60 font-bold uppercase tracking-widest">Disponibilité dans</span>
               <div className="font-mono text-sm font-black text-white flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                 <Clock className="w-4 h-4 text-brand-500" />
                 <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
               </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div 
                 className="h-full rounded-full transition-all duration-1000 ease-linear bg-brand-500 shadow-sm"
                 style={{ width: \`\${timeLeft.percent}%\` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};`;

content = content.replace(activeCardRegex, newActiveCard);
fs.writeFileSync('src/pages/Revenues.tsx', content);
