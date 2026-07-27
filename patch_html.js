import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/href="\/logo\.svg"/g, 'href="/logo.svg?v=2"');
fs.writeFileSync('index.html', content);
