import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dash = dash.replace(
  /Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">2000 FCFA<\/span>/g,
  `Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">1000 FCFA</span>`
);
dash = dash.replace(
  /Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">2 000 FCFA<\/span>/g,
  `Montant minimum de retrait : <span className="font-bold text-slate-900 whitespace-nowrap">1000 FCFA</span>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Fixed info modal text');
