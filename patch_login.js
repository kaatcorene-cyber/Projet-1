import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
content = content.replace(/navigate\('\/admin'\)/g, "navigate('/invest')");
fs.writeFileSync('src/pages/Login.tsx', content);
