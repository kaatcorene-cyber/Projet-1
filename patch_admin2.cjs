const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const target = `<p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Retraits en attente (Brut)</p>
               <p className="text-2xl font-black text-amber-600">{formatCurrency(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0))}</p>
               <p className="text-xs text-slate-500 mt-1">{transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length} demande(s) en cours</p>`;

const replacement = `<div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Retraits en attente (Net)</p>
                    <p className="text-2xl font-black text-amber-600">{formatCurrency(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0) * 0.9, 0))}</p>
                    <p className="text-xs text-slate-500 mt-1">{transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length} demande(s) en cours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Brut (avant frais)</p>
                    <p className="text-sm font-bold text-slate-600">{formatCurrency(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0))}</p>
                  </div>
               </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/pages/Admin.tsx', content, 'utf8');
    console.log("Patched Admin.tsx");
} else {
    console.log("Target not found");
}
