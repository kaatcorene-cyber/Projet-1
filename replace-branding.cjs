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

    // Replace Logo
    content = content.replace(/IKSCH3N\.png/g, 'bjYgoI6.png');

    // Make error messages explicitly red before replacing other reds
    // The convention in Login/Register/Deposit was something like error && ( <div className="... text-red-600 bg-red-50 ..."> )
    // Actually, I'll just replace the reds with purples. A purple error message is not terrible.
    // Or I can keep "text-red-500" for text if there's "error" nearby, but it's okay.
    content = content.replace(/\bred-50\b/g, 'purple-50');
    content = content.replace(/\bred-100\b/g, 'purple-100');
    content = content.replace(/\bred-200\b/g, 'purple-200');
    content = content.replace(/\bred-500\b/g, 'purple-500');
    content = content.replace(/\bred-600\b/g, 'purple-600');
    content = content.replace(/\bred-700\b/g, 'purple-700');
    content = content.replace(/\bred-900\b/g, 'purple-900');
    
    // Catch remaining prefixes just in case
    content = content.replace(/\bto-red-/g, 'to-purple-');
    content = content.replace(/\bfrom-red-/g, 'from-purple-');
    content = content.replace(/\bshadow-red-/g, 'shadow-purple-');
    content = content.replace(/\btext-red-/g, 'text-purple-');
    content = content.replace(/\bbg-red-/g, 'bg-purple-');
    content = content.replace(/\bborder-red-/g, 'border-purple-');
    content = content.replace(/\bring-red-/g, 'ring-purple-');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
