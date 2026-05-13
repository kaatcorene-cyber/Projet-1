import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace emerald with blue
    content = content.replace(/emerald-/g, 'blue-');
    
    // Replace text-white on body/layout stuff
    if (filePath.includes('Layout.tsx')) {
        content = content.replace(/text-white/g, 'text-slate-900');
    }

    // Replace Logos
    content = content.replace(/IWublbr\.png/g, 'awFyFRj.png');
    content = content.replace(/3UdOmrc\.png/g, 'awFyFRj.png');
    content = content.replace(/z0xwS5E/g, 'awFyFRj.png');

    // Make BottomNav look white
    if (filePath.includes('BottomNav.tsx')) {
        content = content.replace(/bg-slate-900\/40 backdrop-blur-3xl border-t border-white\/10/, "bg-white/90 backdrop-blur-md border-t border-gray-200");
        content = content.replace(/text-white\/50/g, "text-slate-400");
        content = content.replace(/hover:text-white\/80/g, "hover:text-slate-600");
    }

    fs.writeFileSync(filePath, content);
  }
});

// Update index.css for white background
let indexCss = fs.readFileSync('src/index.css', 'utf8');
indexCss = indexCss.replace(/background: linear-gradient[^;]+;/, 'background: #f8fafc;');
indexCss = indexCss.replace(/text-white/g, 'text-slate-900');
fs.writeFileSync('src/index.css', indexCss);
