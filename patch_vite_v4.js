import fs from 'fs';
let vite = fs.readFileSync('vite.config.ts', 'utf8');
vite = vite.replace(/\?v=3/g, "?v=4");
fs.writeFileSync('vite.config.ts', vite);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\.png"/g, '.png?v=4"');
fs.writeFileSync('index.html', html);
