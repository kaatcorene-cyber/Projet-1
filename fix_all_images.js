import fs from 'fs';
import path from 'path';

const pagesDir = 'src/pages';
const files = fs.readdirSync(pagesDir).map(file => path.join(pagesDir, file));

files.forEach(file => {
    if (file.endsWith('.tsx')) {
        let code = fs.readFileSync(file, 'utf8');
        // Replace agricultural cows image
        code = code.replace(/https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800/g, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800');
        
        fs.writeFileSync(file, code);
    }
});
console.log("Images checked.");
