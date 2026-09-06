import fs from 'fs';
let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

// For CountdownTimer active packs
content = content.replace(
  '              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif</span>',
  '              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">{getPlanName(inv.plan_amount)}</span>'
);

// For the available plans list
content = content.replace(
  '                       <h3 className="text-xl font-black text-white leading-tight tracking-tight">{formatCurrency(plan.amount)}</h3>',
  '                       <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-0.5 block">{getPlanName(plan.amount)}</span>\n                       <h3 className="text-xl font-black text-white leading-tight tracking-tight">{formatCurrency(plan.amount)}</h3>'
);

// Update the message at the top
content = content.replace(
  `      <div className="max-w-md mx-auto mb-6 text-center">
         <p className="text-blue-200/80 text-sm font-medium bg-white/5 inline-block px-4 py-2 rounded-full border border-white/10 shadow-sm">
           Sélectionnez un pack pour générer des revenus passifs 🚀
         </p>
      </div>`,
  `      <div className="max-w-md mx-auto mb-8 text-center pt-4">
         <h1 className="text-2xl font-black text-white tracking-tight mb-3">Boutique de Jus</h1>
         <p className="text-blue-200/80 text-sm font-medium bg-white/5 inline-block px-4 py-2 rounded-full border border-white/10 shadow-sm">
           Investissez dans nos jus fruités pour générer des revenus 🍹
         </p>
      </div>`
);

fs.writeFileSync('src/pages/Revenues.tsx', content);
