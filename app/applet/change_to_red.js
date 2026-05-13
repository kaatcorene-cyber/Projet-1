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
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
         results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir(SRC_DIR);
files.push('./index.html');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replaces = [
    { from: /bg-blue-/g, to: 'bg-red-' },
    { from: /text-blue-/g, to: 'text-red-' },
    { from: /border-blue-/g, to: 'border-red-' },
    { from: /from-blue-/g, to: 'from-red-' },
    { from: /to-blue-/g, to: 'to-red-' },
    { from: /shadow-blue-/g, to: 'shadow-red-' },
    { from: /rgba\(59,130,246,/g, to: 'rgba(239,68,68,' },
    { from: /rgba\(59, 130, 246,/g, to: 'rgba(239, 68, 68,' },
    { from: /59,130,246/g, to: '239,68,68' },
    { from: /59, 130, 246/g, to: '239, 68, 68' }
  ];

  for (const rule of replaces) {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
