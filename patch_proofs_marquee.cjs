const fs = require('fs');
let content = fs.readFileSync('src/pages/Proofs.tsx', 'utf8');

const target = `<div className="space-y-3 flex flex-col">
              {proofs.map((proof, idx) => {`;

const replacement = `<div className="space-y-3 flex flex-col animate-marquee-y">
              {[...proofs, ...proofs].map((proof, idx) => {`;

content = content.replace(target, replacement);

const target2 = `key={proof.id}`;
const replacement2 = `key={\`\${proof.id}-\${idx}\`}`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/pages/Proofs.tsx', content);
