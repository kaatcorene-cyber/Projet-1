import fs from 'fs';

const getPlanImageFunc = `
const getPlanImage = (amount) => {
  const amt = Number(String(amount).replace(/\\D/g, ''));
  let emoji = '🍓';
  let c1 = '#ff758c';
  let c2 = '#ff7eb3';
  
  if (amt === 5000) { emoji = '🍉'; c1 = '#ff9a9e'; c2 = '#fecfef'; }
  else if (amt === 8000) { emoji = '🥝'; c1 = '#d4fc79'; c2 = '#96e6a1'; }
  else if (amt === 15000) { emoji = '🍇'; c1 = '#a18cd1'; c2 = '#fbc2eb'; }
  else if (amt === 35000) { emoji = '🍒'; c1 = '#ff0844'; c2 = '#ffb199'; }
  else if (amt === 80000) { emoji = '🍋'; c1 = '#f6d365'; c2 = '#fda085'; }
  else if (amt === 200000) { emoji = '🍏'; c1 = '#84fab0'; c2 = '#8fd3f4'; }
  else if (amt === 500000) { emoji = '🍌'; c1 = '#ffe259'; c2 = '#ffa751'; }

  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g\${amt}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="\${c1}" />
        <stop offset="100%" stop-color="\${c2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g\${amt})" />
    <text y="55%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">\${emoji}</text>
  </svg>\`;
  return \`data:image/svg+xml;utf8,\${encodeURIComponent(svg)}\`;
};
`;

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  
  // Remove FRUIT_IMAGES array completely
  content = content.replace(/const FRUIT_IMAGES = \[[^\]]*\];?/g, '');
  
  // Replace the old getPlanImage func
  const oldFuncRegex = /const getPlanImage = \(amount\) => \{[\s\S]*?\n\};/g;
  if (oldFuncRegex.test(content)) {
    content = content.replace(oldFuncRegex, getPlanImageFunc.trim());
  } else {
    // If not found (e.g. Products.tsx?), insert before export function
    content = content.replace(/export function/g, getPlanImageFunc.trim() + "\n\nexport function");
  }
  
  fs.writeFileSync(filepath, content);
}

patchFile('src/pages/Revenues.tsx');
patchFile('src/pages/Products.tsx');

