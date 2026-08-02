import fs from 'fs';
let content = fs.readFileSync('src/pages/History.tsx', 'utf8');

content = content.replace(
  /case 'completed': return <span className="text-orange-500 text-\[11px\] font-bold">Payé<\/span>;/,
  `case 'completed': 
      case 'approved': return <span className="text-orange-500 text-[11px] font-bold">Payé</span>;`
);

fs.writeFileSync('src/pages/History.tsx', content);
