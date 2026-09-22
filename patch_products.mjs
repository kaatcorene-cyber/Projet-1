import fs from 'fs';
let content = fs.readFileSync('src/pages/Products.tsx', 'utf-8');

content = content.replace(
  '              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif</span>',
  '              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">{getPlanName(inv.plan_amount)}</span>'
);

fs.writeFileSync('src/pages/Products.tsx', content);
