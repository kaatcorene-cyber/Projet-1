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
    
    // Replace <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md"> with <div className="bg-gray-50 p-2 rounded-xl">
    content = content.replace(/<div className="bg-white\/20 p-1\.5 rounded-xl backdrop-blur-md">/g, '<div className="bg-gray-50 p-2 border border-gray-100 rounded-xl">');
    
    // Replace <h1 className="text-2xl font-bold text-white"> with text-gray-900
    content = content.replace(/text-2xl font-bold text-white/g, 'text-2xl font-bold text-gray-900');
    content = content.replace(/text-xl font-bold text-white/g, 'text-xl font-bold text-gray-900');
    
    // Make headers white and shadow
    content = content.replace(/<header className="flex items-center justify-between">/g, '<header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">');
    
    // Empty plan state text text-white/70 to text-gray-500
    content = content.replace(/className="text-white\/70/g, 'className="text-gray-500');

    // Make text-white inside Withdraw and deposit labels text-gray-900
    content = content.replace(/<h2 className="text-white font-bold mb-4">/g, '<h2 className="text-gray-900 font-bold mb-4">');
    content = content.replace(/<p className="text-white\/80 text-sm">/g, '<p className="text-gray-500 text-sm">');
    
    // Remove background blobs that look bad on white background
    content = content.replace(/<div className="absolute top-0 right-0 w-32 h-32 bg-white\/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"><\/div>/g, '');
    content = content.replace(/<div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"><\/div>/g, '');
    
    fs.writeFileSync(filePath, content);
  }
});
