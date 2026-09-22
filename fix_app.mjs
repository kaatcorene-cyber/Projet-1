import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/image: FRUIT_IMAGES\[\d\]/g, "image: ''");

fs.writeFileSync('src/App.tsx', content);
