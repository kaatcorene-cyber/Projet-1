const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    content = content.replace(/blur-\[100px\]/g, 'blur-3xl');
    content = content.replace(/blur-\[120px\]/g, 'blur-3xl');
    content = content.replace(/blur-\[80px\]/g, 'blur-3xl');
    content = content.replace(/blur-\[60px\]/g, 'blur-2xl');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
}
