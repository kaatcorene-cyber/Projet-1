const fs = require('fs');
let content = fs.readFileSync('src/pages/Proofs.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/Proofs.tsx', content);
