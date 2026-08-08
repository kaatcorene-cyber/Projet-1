const fs = require('fs');
let content = fs.readFileSync('src/pages/Proofs.tsx', 'utf8');

content = content.replace(/<motion\.div/g, '<div');
content = content.replace(/<\/motion\.div>/g, '</div>');
content = content.replace(/initial=\{\{.*?\}\}/g, '');
content = content.replace(/animate=\{\{.*?\}\}/g, '');
content = content.replace(/transition=\{\{.*?\}\}/g, '');

fs.writeFileSync('src/pages/Proofs.tsx', content);
