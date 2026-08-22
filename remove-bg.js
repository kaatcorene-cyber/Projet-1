const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('min-h-screen bg-gray-50')) {
    content = content.replace(/min-h-screen bg-gray-50/g, 'min-h-screen bg-transparent');
  } else if (content.includes('bg-gray-50 min-h-screen')) {
    content = content.replace(/bg-gray-50 min-h-screen/g, 'bg-transparent min-h-screen');
  }
  
  // also check Invest.tsx which has 'min-h-screen bg-gray-50' separated or differently ordered
  content = content.replace(/min-h-screen bg-gray-50/g, 'min-h-screen bg-transparent');
  content = content.replace(/bg-gray-50 pb-24 font-sans/g, 'bg-transparent pb-24 font-sans');
  content = content.replace(/pb-24 min-h-screen bg-gray-50/g, 'pb-24 min-h-screen bg-transparent');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Done');
