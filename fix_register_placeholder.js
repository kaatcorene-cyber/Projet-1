import fs from 'fs';
let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');
content = content.replace(
  /placeholder="Rempli automatiquement via le lien"/,
  'placeholder=""'
);
fs.writeFileSync('src/pages/Register.tsx', content);
