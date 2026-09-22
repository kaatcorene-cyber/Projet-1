import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

withdraw = withdraw.replace(
  /if \(numAmount < 2000\) \{\n      setError\('Le montant minimum de retrait est de 2000 FCFA\.'\);\n      return;\n    \}/g,
  `if (numAmount < 1000) {\n      setError('Le montant minimum de retrait est de 1000 FCFA.');\n      return;\n    }`
);

fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
console.log('Fixed withdraw minimum');
