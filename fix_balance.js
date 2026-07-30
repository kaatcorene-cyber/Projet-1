import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target = `<h2 className="text-4xl font-black tracking-tight">{formatCurrency(balance)}</h2>`;
const replacement = `<h2 className="text-4xl font-black tracking-tight flex items-baseline gap-1.5">
                      {new Intl.NumberFormat('fr-FR').format(balance)}
                      <span className="text-xl font-bold text-slate-300">FCFA</span>
                    </h2>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Fixed balance size');
