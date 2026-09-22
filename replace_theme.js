import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace Limak with Olam Agri
    content = content.replace(/Limak/g, 'Olam Agri');

    // Replace emerald and green with orange
    content = content.replace(/emerald-50/g, 'orange-50');
    content = content.replace(/emerald-100/g, 'orange-100');
    content = content.replace(/emerald-200/g, 'orange-200');
    content = content.replace(/emerald-300/g, 'orange-300');
    content = content.replace(/emerald-400/g, 'orange-400');
    content = content.replace(/emerald-500/g, 'orange-500');
    content = content.replace(/emerald-600/g, 'orange-600');
    content = content.replace(/emerald-700/g, 'orange-700');
    content = content.replace(/emerald-800/g, 'orange-800');
    content = content.replace(/emerald-900/g, 'orange-900');

    content = content.replace(/green-500/g, 'orange-500');
    content = content.replace(/green-600/g, 'orange-600');
    content = content.replace(/green-700/g, 'orange-700');
    
    // Some specific cases like text-emerald, bg-emerald, shadow-emerald, border-emerald
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
