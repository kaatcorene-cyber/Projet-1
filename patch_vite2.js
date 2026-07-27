import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/includeAssets: \['logo\.svg\?v=2'\]/, "includeAssets: ['logo.svg']");
fs.writeFileSync('vite.config.ts', content);
