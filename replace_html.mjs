import fs from 'fs';

const htmlFile = 'index.html';
let html = fs.readFileSync(htmlFile, 'utf8');
html = html.replace(/Adela Mining/g, 'Nova Platform');
html = html.replace(/https:\/\/i\.imgur\.com\/bjYgoI6\.png/g, 'https://images.unsplash.com/photo-1614680376573-3e4e1ef4142a?w=128&h=128&fit=crop&q=80');
fs.writeFileSync(htmlFile, html);

const metaFile = 'metadata.json';
let meta = fs.readFileSync(metaFile, 'utf8');
meta = meta.replace(/"name":\s*".*?"/, '"name": "Nova Platform"');
fs.writeFileSync(metaFile, meta);
