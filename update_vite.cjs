const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/type: 'image\/svg\+xml'/g, "type: 'image/png'");
fs.writeFileSync('vite.config.ts', content);
