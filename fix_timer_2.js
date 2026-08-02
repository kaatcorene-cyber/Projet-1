import fs from 'fs';

let content = fs.readFileSync('src/pages/Products.tsx', 'utf8');
content = content.replace(
  /const elapsed = now - lastPaid;/g,
  `const elapsed = timeElapsed % totalDuration;`
);
fs.writeFileSync('src/pages/Products.tsx', content);
