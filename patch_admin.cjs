const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(
  'const l2Bonus = amount * 0.05;',
  'const l2Bonus = amount * 0.03;'
);
content = content.replace(
  "reference: 'Bonus 1er dépôt L2 (5%)'",
  "reference: 'Bonus 1er dépôt L2 (3%)'"
);

content = content.replace(
  'const l3Bonus = amount * 0.025;',
  'const l3Bonus = amount * 0.02;'
);
content = content.replace(
  "reference: 'Bonus 1er dépôt L3 (2.5%)'",
  "reference: 'Bonus 1er dépôt L3 (2%)'"
);

fs.writeFileSync('src/pages/Admin.tsx', content);
