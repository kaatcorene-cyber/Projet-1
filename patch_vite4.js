import fs from 'fs';
let vite = fs.readFileSync('vite.config.ts', 'utf8');
vite = vite.replace(/src: '\/logo_olam\.png'/g, "src: '/logo_olam.png?v=3'");
fs.writeFileSync('vite.config.ts', vite);
