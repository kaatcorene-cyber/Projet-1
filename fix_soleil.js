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

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replaces = [
    { from: /Soleil-Power/g, to: 'SIM.COM' },
    { from: /SoleilPower/g, to: 'SIM.COM' },
    { from: /soleil-power entreprise/g, to: 'SIM.COM entreprise' },
    { from: /soleil-app-storage/g, to: 'sim-app-storage' },
    { from: /https:\/\/soleil-power.xyz/g, to: 'https://sim.com' }
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
