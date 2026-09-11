import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
         results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir(SRC_DIR);

let replacements = [
  { from: /bg-\[\#0a0a0a\]/g, to: 'bg-gray-50' },
  { from: /bg-\[\#111\]/g, to: 'bg-white' },
  { from: /bg-\[\#1a1a1a\]/g, to: 'bg-gray-100' },
  { from: /text-gray-100/g, to: 'text-gray-900' },
  { from: /text-gray-200/g, to: 'text-gray-800' },
  { from: /text-gray-300/g, to: 'text-gray-700' },
  { from: /text-gray-400/g, to: 'text-gray-600' },
  { from: /text-gray-500/g, to: 'text-gray-500' }, // unchanged but fine
  { from: /border-white\/5/g, to: 'border-black/5' },
  { from: /border-white\/10/g, to: 'border-black/10' },
  { from: /border-white\/20/g, to: 'border-black/20' },
  { from: /bg-white\/5/g, to: 'bg-black/5' },
  { from: /bg-white\/10/g, to: 'bg-black/10' },
  { from: /bg-white\/20/g, to: 'bg-black/20' },
  { from: /bg-black\/80/g, to: 'bg-black/60' },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const rule of replacements) {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to);
      changed = true;
    }
  }

  // Handle text-white context carefully.
  // Not all text-white should be text-gray-900 (e.g., text on amber buttons might be text-white, though in this app it's text-black)
  // Let's replace text-white with text-gray-900 globally, 
  // except for things like "bg-amber-500 text-white" which might happen.
  // Actually, let's just do it.
  if (content.includes('text-white')) {
    content = content.replace(/text-white/g, 'text-gray-900');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
