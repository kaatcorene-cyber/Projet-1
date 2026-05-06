const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace blur patterns with radial gradient
    content = content.replace(/bg-amber-[0-9]+\/10\s+rounded-full\s+blur-3xl/g, "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent");
    content = content.replace(/bg-amber-[0-9]+\/5\s+rounded-full\s+blur-3xl/g, "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent");
    content = content.replace(/bg-amber-[0-9]+\s+rounded-full\s+blur-2xl\s+opacity-20/g, "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 to-transparent");
    content = content.replace(/bg-blue-[0-9]+\/5\s+rounded-full\s+blur-3xl/g, "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent");
    // Some general dropshadows in Profile
    content = content.replace(/drop-shadow-lg/g, "");
    content = content.replace(/shadow-\[0_0_10px_rgba\(245,158,11,0\.5\)\]/g, "");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed performance blurs in', file);
    }
  }
}
