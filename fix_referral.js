import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /const l1Bonus = amount \* 0\.20;/g,
  "const l1Bonus = amount * 0.10;"
);
admin = admin.replace(
  /reference: 'Bonus 1er dépôt L1 \(20%\)'/g,
  "reference: 'Bonus 1er dépôt L1 (10%)'"
);

admin = admin.replace(
  /const l2Bonus = amount \* 0\.03;/g,
  "const l2Bonus = amount * 0.05;"
);
admin = admin.replace(
  /reference: 'Bonus 1er dépôt L2 \(3%\)'/g,
  "reference: 'Bonus 1er dépôt L2 (5%)'"
);

admin = admin.replace(
  /const l3Bonus = amount \* 0\.02;/g,
  "const l3Bonus = amount * 0.025;"
);
admin = admin.replace(
  /reference: 'Bonus 1er dépôt L3 \(2%\)'/g,
  "reference: 'Bonus 1er dépôt L3 (2.5%)'"
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed referral bonuses');
