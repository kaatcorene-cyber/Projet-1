import fs from 'fs';

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// remove window.confirm from handleRemoveInvestment
content = content.replace(
  "if (!window.confirm('Voulez-vous vraiment supprimer cet investissement ?')) return;",
  "// removed confirm"
);

// remove window.confirm from handleTransaction
content = content.replace(
  /const typeText = type === 'deposit' \? 'ce dépôt' : 'ce retrait';\s*if \(!window\.confirm\(`Voulez-vous vraiment \$\{actionText\} \$\{typeText\} \?`\)\) return;/g,
  ""
);

fs.writeFileSync('src/pages/Admin.tsx', content);

console.log("Removed window.confirm !");
