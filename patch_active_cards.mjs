import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const oldCard = `<div className="bg-white/10 rounded-[24px] p-5 border border-white/20 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-wider mb-1 block">{getPlanName(inv.plan_amount)}</span>
          <h3 className="text-xl font-black text-white leading-none">{formatCurrency(inv.plan_amount)}</h3>
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm">
          <Clock className="w-4 h-4 text-blue-200/60" />
          <span className="text-white/90 font-bold text-xs">{plan?.duration || 30} Jrs</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
         <div className="flex flex-col bg-[#03296c] p-3 rounded-2xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
            <span className="text-brand-600 font-black text-sm leading-none">{formatCurrency(inv.daily_yield)}</span>
         </div>
         <div className="flex flex-col bg-[#03296c] p-3 rounded-2xl border border-white/10">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1">Gain total</span>
            <span className="text-white font-black text-sm leading-none">{formatCurrency(Number(inv.daily_yield) * (plan?.duration || 30))}</span>
         </div>
      </div>
      <div className="pt-2">
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-black text-sm hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Collecter mes gains'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 bg-[#03296c] p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center w-full">
               <span className="text-[10px] text-blue-200/60 font-bold uppercase tracking-widest">Disponibilité dans</span>
               <div className="font-mono text-sm font-black text-white flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                 <Clock className="w-4 h-4 text-brand-500" />
                 <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
               </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                 className="h-full rounded-full transition-all duration-1000 ease-linear bg-brand-500 shadow-sm"
                 style={{ width: \`\${timeLeft.percent}%\` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>`;


const newCard = `<div className="bg-white/5 rounded-3xl p-5 border border-brand-500/30 shadow-[0_0_20px_-10px_rgba(var(--brand-500),0.3)] flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif • {getPlanName(inv.plan_amount)}</span>
          <h3 className="text-2xl font-black text-white leading-none">{formatCurrency(inv.plan_amount)}</h3>
        </div>
        <div className="bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-400" />
          <span className="text-brand-100 font-bold text-xs">{plan?.duration || 30} Jrs restants</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
         <div className="flex-1 flex flex-col bg-[#03296c]/50 p-3 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1 block">Gain par jour</span>
            <span className="text-brand-400 font-black text-sm">{formatCurrency(inv.daily_yield)}</span>
         </div>
         <div className="flex-1 flex flex-col bg-[#03296c]/50 p-3 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-blue-200/60 text-[10px] font-bold uppercase mb-1 block">Gain total</span>
            <span className="text-white font-black text-sm">{formatCurrency(Number(inv.daily_yield) * (plan?.duration || 30))}</span>
         </div>
      </div>

      <div>
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-4 rounded-2xl bg-brand-500 text-white font-black text-sm hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/30 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Réclamer mes gains'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 bg-[#03296c]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center w-full">
               <span className="text-[10px] text-blue-200/60 font-bold uppercase tracking-widest">Gains disponibles dans</span>
               <div className="font-mono text-sm font-black text-brand-400 flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                 <Clock className="w-4 h-4" />
                 <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
               </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                 className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-brand-400 to-brand-600 shadow-sm"
                 style={{ width: \`\${timeLeft.percent}%\` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>`;

content = content.replace(oldCard, newCard);
fs.writeFileSync('src/pages/Revenues.tsx', content);
