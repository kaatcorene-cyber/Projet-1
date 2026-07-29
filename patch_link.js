import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(/https:\/\/t\.me\/\+ojAqyDFSzRJhZjVk/g, 'https://t.me/+_WVnzoKbc89jMDQ0');
fs.writeFileSync('src/pages/Dashboard.tsx', content);

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminContent = adminContent.replace(/https:\/\/t\.me\/\+ojAqyDFSzRJhZjVk/g, 'https://t.me/+_WVnzoKbc89jMDQ0');
fs.writeFileSync('src/pages/Admin.tsx', adminContent);

console.log('patched code');
