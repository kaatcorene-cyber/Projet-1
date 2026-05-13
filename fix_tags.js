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
      if (filePath.endsWith('.tsx')) {
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

  if (content.includes('<className=')) {
    content = content.replace(/<className=/g, '<img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo" className=');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
