const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const target = `<div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total des soldes</p>`;

const replacement = `<div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-2">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Retraits en attente (Brut)</p>
               <p className="text-2xl font-black text-amber-600">{formatCurrency(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0))}</p>
               <p className="text-xs text-slate-500 mt-1">{transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length} demande(s) en cours</p>
            </div>
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total des soldes</p>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/pages/Admin.tsx', content, 'utf8');
    console.log("Patched Admin.tsx");
} else {
    console.log("Target not found");
}
