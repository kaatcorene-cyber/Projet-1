const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/bg-purple-50 border border-purple-100 rounded-xl text-purple-600/g, 'bg-red-50 border border-red-100 rounded-xl text-red-600');
    // For specific inputs error rings
    content = content.replace(/focus:border-purple-500 focus:ring-purple-500/g, 'focus:border-purple-500 focus:ring-purple-500'); // keep standard inputs purple
    // Fix deposit warnings
    content = content.replace(/text-purple-700 font-bold bg-purple-50 p-3 rounded-lg border border-purple-100/g, 'text-red-700 font-bold bg-red-50 p-3 rounded-lg border border-red-100');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed errors in', filePath);
    }
  }
});
