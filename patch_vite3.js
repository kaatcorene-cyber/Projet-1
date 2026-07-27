import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace(/includeAssets: \['logo\.svg'\]/, "includeAssets: ['logo.jpg']");
content = content.replace(/src: '\/logo\.svg\?v=2'/g, "src: '/logo.jpg'");
content = content.replace(/type: 'image\/svg\+xml'/g, "type: 'image/jpeg'");

fs.writeFileSync('vite.config.ts', content);
