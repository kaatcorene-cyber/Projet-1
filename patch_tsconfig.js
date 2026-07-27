import fs from 'fs';
let content = fs.readFileSync('tsconfig.json', 'utf8');
const parsed = JSON.parse(content);
parsed.exclude = ["node_modules", "dist"];
fs.writeFileSync('tsconfig.json', JSON.stringify(parsed, null, 2));
