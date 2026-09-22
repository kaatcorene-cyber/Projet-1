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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace dark gray bg with white or red
    content = content.replace(/bg-\[\#1a1c23\]/g, 'bg-white');
    content = content.replace(/bg-slate-950/g, 'bg-gray-50');
    content = content.replace(/bg-slate-900/g, 'bg-white');
    content = content.replace(/bg-slate-800/g, 'bg-gray-100');
    content = content.replace(/bg-gray-900/g, 'bg-red-600');
    content = content.replace(/hover:bg-gray-800/g, 'hover:bg-red-700');
    content = content.replace(/hover:bg-black/g, 'hover:bg-red-700');
    content = content.replace(/bg-white\/10 backdrop-blur-2xl border border-white\/20/g, 'bg-white border border-gray-100');
    content = content.replace(/border-gray-800/g, 'border-gray-100');

    // Layout
    content = content.replace(/bg-white border border-gray-200 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50/g, 'bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-red-600 shadow-sm hover:bg-gray-200');

    // Error messages in login/register
    content = content.replace(/bg-red-500\/20 border border-red-500\/50 rounded-xl text-red-100/g, 'bg-red-50 border border-red-100 rounded-xl text-red-600');

    // Dashboard timer text
    content = content.replace(/text-gray-400 text-\[10px\] font-bold uppercase tracking-widest/g, 'text-gray-500 text-[10px] font-bold uppercase tracking-widest');
    content = content.replace(/<circle \n            className="text-gray-800"/g, '<circle \n            className="text-gray-200"');

    // Team.tsx
    content = content.replace(/Membres de l'équipe<\/h3>/g, 'Membres de l\'équipe</h3>');
    content = content.replace(/text-white font-medium transition-colors shadow-sm cursor-pointer/g, 'text-white font-medium transition-colors shadow-sm cursor-pointer');

    // BottomNav
    content = content.replace(/fixed bottom-0 left-0 right-0 bg-white\/90 backdrop-blur-md border-t border-gray-200 pb-safe shadow-\[0_-10px_40px_rgba\(0,0,0,0\.2\)\] z-50/g, 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50');

    fs.writeFileSync(filePath, content);
  }
});
