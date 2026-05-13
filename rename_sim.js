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

let replacements = [
  { from: /SOLEIL-POWER/g, to: 'SIM.COM' },
  { from: /SOLEIL<span/g, to: 'SIM<span' },
  { from: /SOLEIL/g, to: 'SIM' },
  { from: /<Sun /g, to: '<img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo" ' },
  { from: /bg-amber/g, to: 'bg-blue' },
  { from: /text-amber/g, to: 'text-blue' },
  { from: /border-amber/g, to: 'border-blue' },
  { from: /from-amber/g, to: 'from-blue' },
  { from: /to-amber/g, to: 'to-blue' },
  { from: /shadow-amber/g, to: 'shadow-blue' },
  { from: /yellow-400/g, to: 'blue-400' },
  { from: /yellow-500/g, to: 'blue-500' },
  { from: /yellow-600/g, to: 'blue-600' },
  { from: /text-black bg-blue-500/g, to: 'text-white bg-blue-500' },
  { from: /text-black hover:bg-blue/g, to: 'text-white hover:bg-blue' },
  { from: /text-black font-black py-4/g, to: 'text-white font-black py-4' },
  { from: /text-black transition-all/g, to: 'text-white transition-all' },
  { from: /text-black rounded-xl/g, to: 'text-white rounded-xl' },
  { from: /text-black rounded-full/g, to: 'text-white rounded-full' },
  { from: /text-black rounded-\[1\.2rem\]/g, to: 'text-white rounded-[1.2rem]' },
  { from: /Parc Solaire Actif/g, to: 'Parc Actif' },
  { from: /Générateur Solaire/g, to: 'Générateur' },
  { from: /solaire/g, to: 'SIM.COM' } // maybe 'énergie solaire' -> 'système SIM.COM'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Manual fixes before regex
  if (content.includes('import { Sun }')) {
     content = content.replace(/, Sun/g, '');
     content = content.replace(/Sun, /g, '');
     content = content.replace(/Sun /g, '');
     changed = true;
  }
  if (content.includes('import { Sun,')) {
     content = content.replace(/Sun, /g, '');
     changed = true;
  }
  
  // Specific image replace
  content = content.replace(/<img src="https:\/\/i.img[a-zA-Z0-9.\/]*" alt="Générateur Solaire"/g, '<img src="https://i.imgur.com/HfAOyni.jpeg" alt="Générateur"');

  for (const rule of replacements) {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
}
