import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
files.push('index.html');
let replacedCount = 0;

files.forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css') || f.endsWith('.html') || f.endsWith('.json')) {
        let content = fs.readFileSync(f, 'utf8');
        let newContent = content;

        // Replace logo
        newContent = newContent.replace(/https:\/\/i\.imgur\.com\/bjYgoI6\.png/g, 'https://i.imgur.com/CDLHO6I.png');

        // Replace emerald with red globally
        newContent = newContent.replace(/emerald/g, 'red');

        if (content !== newContent) {
            fs.writeFileSync(f, newContent);
            console.log(`Updated ${f}`);
            replacedCount++;
        }
    }
});

console.log(`Updated ${replacedCount} files.`);
