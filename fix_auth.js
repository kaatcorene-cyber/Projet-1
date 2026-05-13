import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src/pages', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Auth screens fixes
    content = content.replace(/text-white\/70/g, 'text-gray-500');
    content = content.replace(/text-white\/80/g, 'text-gray-500');
    content = content.replace(/text-white\/50/g, 'text-gray-400');
    content = content.replace(/text-white\/40/g, 'text-gray-400');
    
    // Inputs in auth
    content = content.replace(/bg-white\/10 border border-white\/20/g, 'bg-white border border-gray-200 shadow-sm');
    content = content.replace(/focus:bg-white\/20 focus:border-white\/50 focus:ring-white\/50/g, 'focus:bg-white focus:border-blue-500 focus:ring-blue-500/20');
    
    // Auth back button
    content = content.replace(/bg-white\/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/g, 'bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200');

    // General headers
    content = content.replace(/<h3 className="text-lg font-bold text-white mb-2">/g, '<h3 className="text-lg font-bold text-gray-900 mb-2">');
    content = content.replace(/<p className="text-gray-50 text-sm font-medium mb-1">/g, '<p className="text-blue-50 text-sm font-medium mb-1">');

    // Dashboard WhatsApp button
    content = content.replace(/text-white font-bold py-4 rounded-2xl/g, 'text-white font-bold py-4 rounded-2xl');

    // Invest card price color
    // Replace text-white on pricing to make it visible against bg-gradient-to-t? Yes, that background is dark blue to transparent, so white text is fine there.

    // Auth screen wrapper text-white
    content = content.replace(/overflow-hidden text-white/g, 'overflow-hidden text-gray-900');

    // Link hover in auth
    content = content.replace(/<Link to="\/login" className="text-white hover:text-blue-300/g, '<Link to="/login" className="text-blue-600 hover:text-blue-700');
    content = content.replace(/<Link to="\/register" className="text-white hover:text-blue-300/g, '<Link to="/register" className="text-blue-600 hover:text-blue-700');

    fs.writeFileSync(filePath, content);
  }
});
