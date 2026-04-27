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
    
    // Auth inputs
    content = content.replace(/ py-3 text-white focus:outline-none focus:bg-white\/20 focus:border-white\/50 focus:ring-1 focus:ring-white\/50/g, ' py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50');
    
    
    // Auth background blobs
    content = content.replace(/<div className="absolute inset-0 bg-blue-500 blur-xl rounded-full opacity-50"><\/div>/g, '<div className="absolute inset-0 bg-blue-100 blur-3xl rounded-full opacity-50"></div>');

    fs.writeFileSync(filePath, content);
  }
});
