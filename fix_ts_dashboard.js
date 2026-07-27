import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace('const generateUserId = (uuid) => {', 'const generateUserId = (uuid: string | undefined) => {');
fs.writeFileSync('src/pages/Dashboard.tsx', content);
