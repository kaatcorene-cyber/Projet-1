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
    
    // Fix success messages
    content = content.replace(/message\.type === 'success' \? 'bg-red-50\/80 border border-red-100 text-red-700' : 'bg-red-50\/80 border border-red-100 text-red-600'/, "message.type === 'success' ? 'bg-green-50/80 border border-green-100 text-green-600' : 'bg-red-50/80 border border-red-100 text-red-600'");
    content = content.replace(/message\.type === 'success' \? 'bg-red-50 text-red-700 border border-red-100' : 'bg-red-50 text-red-600 border border-red-100'/, "message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'");
    
    content = content.replace(/tx\.status === 'completed' \|\| tx\.status === 'approved' \? 'text-red-600' :/g, "tx.status === 'completed' || tx.status === 'approved' ? 'text-green-500' :");
    content = content.replace(/tx\.status === 'pending' \? 'text-yellow-500'/g, "tx.status === 'pending' ? 'text-amber-500'");
    
    content = content.replace(/tx\.status === 'completed' \|\| tx\.status === 'approved'\n                    \? 'bg-red-50 text-red-600'/g, "tx.status === 'completed' || tx.status === 'approved'\n                    ? 'bg-green-50 text-green-600'");

    fs.writeFileSync(filePath, content);
  }
});
