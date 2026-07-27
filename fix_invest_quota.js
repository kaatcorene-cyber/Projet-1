import fs from 'fs';
let content = fs.readFileSync('src/pages/Invest.tsx', 'utf8');
content = content.replace('{plan.duration || 60} Jours', 'Quota 0/2');
fs.writeFileSync('src/pages/Invest.tsx', content);
