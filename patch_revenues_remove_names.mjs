import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

// For the active card (CountdownTimer)
content = content.replace(
  /<span className="text-blue-200\/60 text-\[10px\] font-bold uppercase tracking-wider mb-1 block">\{getPlanName\(inv.plan_amount\)\}<\/span>/g,
  ''
);

// For the new cards (mapped activePlans)
content = content.replace(
  /<span className="text-blue-200 text-\[10px\] font-bold uppercase tracking-wider block mb-1 drop-shadow-md">\{getPlanName\(plan\.amount\)\}<\/span>/g,
  ''
);

// Second patch if I missed some specific tag in active cards
content = content.replace(
  /<span className="text-brand-400 text-\[10px\] font-black uppercase tracking-widest mb-1 block">Pack Actif • \{getPlanName\(inv\.plan_amount\)\}<\/span>/g,
  '<span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif</span>'
);

fs.writeFileSync('src/pages/Revenues.tsx', content);
