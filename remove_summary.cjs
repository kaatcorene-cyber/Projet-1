const fs = require('fs');
let content = fs.readFileSync('src/pages/History.tsx', 'utf8');

const target = `      {/* Summary Header */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-slate-200/50 flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
               <ArrowDown className="w-5 h-5 text-emerald-400" />
             </div>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Entrées</p>
             <p className="text-slate-900 font-black text-lg">
               {formatCurrency(transactions.filter(t => t.type !== 'withdrawal' && t.type !== 'investment').reduce((sum, t) => sum + t.amount, 0))}
             </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-slate-200/50 flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
               <ArrowUp className="w-5 h-5 text-slate-500" />
             </div>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Sorties</p>
             <p className="text-slate-900 font-black text-lg">
               {formatCurrency(transactions.filter(t => t.type === 'withdrawal' || t.type === 'investment').reduce((sum, t) => sum + t.amount, 0))}
             </p>
          </div>
        </div>
      )}`;

content = content.replace(target, '');
fs.writeFileSync('src/pages/History.tsx', content);
