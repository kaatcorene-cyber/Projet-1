import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

// Make the active plans (investments) text slightly more elegant
content = content.replace(/className="text-2xl font-black text-white leading-none"/g, 'className="text-2xl font-black text-white leading-none tracking-tight"');

// Make the available plans text slightly more elegant
content = content.replace(/className="text-lg font-black text-white leading-none drop-shadow-md"/g, 'className="text-xl font-black text-white leading-none drop-shadow-md tracking-tight"');

fs.writeFileSync('src/pages/Revenues.tsx', content);
