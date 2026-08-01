import fs from 'fs';

let bank = fs.readFileSync('src/pages/Bank.tsx', 'utf8');
bank = bank.replace(
  '<label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Nom du titulaire (si différent)</label>',
  '<label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Nom du titulaire</label>'
);
fs.writeFileSync('src/pages/Bank.tsx', bank);

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');
withdraw = withdraw.replace(
  /\s*<div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm font-medium flex items-start gap-3 shadow-sm">\s*<Info className="w-5 h-5 flex-shrink-0 mt-0\.5" \/>\s*<p>Les retraits sont traités sous 24h\. Le montant minimum est de 1000 FCFA avec 10% de frais\.<\/p>\s*<\/div>/,
  ""
);
fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
console.log('Fixed requested UI updates');
