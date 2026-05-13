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
      if (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
         results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir(SRC_DIR);
files.push('./index.html');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('245,158,11')) {
    content = content.replace(/245,158,11/g, '59,130,246');
    changed = true;
  }
  if (content.includes('245, 158, 11')) {
    content = content.replace(/245, 158, 11/g, '59, 130, 246');
    changed = true;
  }

  // Also replace text-black from buttons previously modified if any remaining on blue buttons
  if (content.includes('bg-blue-500 hover:bg-blue-400 text-black')) {
      content = content.replace(/bg-blue-500 hover:bg-blue-400 text-black/g, 'bg-blue-500 hover:bg-blue-400 text-white');
      changed = true;
  }
  if (content.includes('bg-blue-50 text-blue-500')) {
      content = content.replace(/bg-blue-50 text-blue-500/g, 'bg-blue-100 text-blue-600');
      changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
