import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (f === 'node_modules' || f === '.git' || f === 'dist') return;
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Replace Logo
  content = content.replace(/https:\/\/i\.imgur\.com\/CDLHO6I\.png/g, 'https://i.imgur.com/20bDoyM.png');
  
  // Replace red with blue
  content = content.replace(/red-600/g, 'blue-700');
  content = content.replace(/red-500/g, 'blue-600');
  content = content.replace(/red-400/g, 'blue-500');
  content = content.replace(/red-700/g, 'blue-800');
  content = content.replace(/red-50/g, 'blue-50');
  content = content.replace(/red-100/g, 'blue-100');
  content = content.replace(/red-200/g, 'blue-200');

  // Replace orange with cyan
  content = content.replace(/orange-600/g, 'cyan-700');
  content = content.replace(/orange-500/g, 'cyan-600');
  content = content.replace(/orange-400/g, 'cyan-500');
  content = content.replace(/orange-700/g, 'cyan-800');
  content = content.replace(/orange-50/g, 'cyan-50');
  content = content.replace(/orange-100/g, 'cyan-100');
  content = content.replace(/orange-200/g, 'cyan-200');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Replaced colors in ${filePath}`);
  }
});
