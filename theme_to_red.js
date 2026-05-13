import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const RED = 'red-600';
const RED_HOVER = 'red-700';

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all blue-X color classes with red-X
    content = content.replace(/blue-50/g, 'red-50');
    content = content.replace(/blue-100/g, 'red-100');
    content = content.replace(/blue-200/g, 'red-200');
    content = content.replace(/blue-300/g, 'red-300');
    content = content.replace(/blue-400/g, 'red-400');
    content = content.replace(/blue-500/g, 'red-600'); // make primary red a bit stronger
    content = content.replace(/blue-600/g, 'red-700'); // hover/darker red
    content = content.replace(/blue-700/g, 'red-800');
    content = content.replace(/blue-800/g, 'red-900');
    content = content.replace(/blue-900/g, 'red-950');
    
    // Some buttons were set to use bg-gray-900 or bg-blue-500, let's keep them styled nice with red
    
    fs.writeFileSync(filePath, content);
  }
});

let indexCss = fs.readFileSync('src/index.css', 'utf8');
indexCss = indexCss.replace(/background: #f8fafc;/, 'background: #ffffff;');

// Remove the obsolete color mapping block inside @theme
indexCss = indexCss.replace(/\/\* Adapting the platform theme.*[\s\S]*?--color-\w+-950: [^;]+;/g, '/* Theme settings for QUALCOMM (Red/White) */');

fs.writeFileSync('src/index.css', indexCss);
