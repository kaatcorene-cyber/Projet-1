import fs from 'fs';
let content = fs.readFileSync('src/pages/History.tsx', 'utf8');

content = content.replace(
  /<p className="font-bold text-slate-900 text-\[15px\] leading-tight">\{getLabel\(tx\.type\)\}<\/p>/,
  `<p className="font-bold text-slate-900 text-[15px] leading-tight">{tx.reference || getLabel(tx.type)}</p>`
);

fs.writeFileSync('src/pages/History.tsx', content);
