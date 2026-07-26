import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
content = content.replace(/\.eq\('password_hash', password\)/, `.eq('password_hash', password.trim())`);
fs.writeFileSync('src/pages/Login.tsx', content);
