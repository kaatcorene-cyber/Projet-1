import fs from 'fs';

let content = fs.readFileSync('src/pages/Invest.tsx', 'utf8');
content = content.replace(/<span className="inline-flex items-center gap-1 px-2 py-0\.5 bg-orange-50 text-orange-700 rounded-lg text-\[10px\] font-bold uppercase tracking-wider shrink-0">\s*Quota 0\/2\s*<\/span>/g, '');
fs.writeFileSync('src/pages/Invest.tsx', content);

console.log('patched');
