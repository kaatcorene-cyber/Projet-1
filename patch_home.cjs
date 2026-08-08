const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /  const getPlanName = \([\s\S]*?return 'Projet Agricole';\n  };\n/g;
content = content.replace(regex, '');

fs.writeFileSync('src/pages/Home.tsx', content);
