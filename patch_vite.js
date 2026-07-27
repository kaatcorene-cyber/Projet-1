import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/logo\.svg/g, 'logo.svg?v=2');
fs.writeFileSync('vite.config.ts', content);
