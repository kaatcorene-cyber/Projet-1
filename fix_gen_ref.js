import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(
  /const chars = 'abcdefghijklmnopqrstuvwxyz';/,
  `const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';`
);

fs.writeFileSync('src/pages/Register.tsx', content);
