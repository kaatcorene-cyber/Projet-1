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
files.forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css') || f.endsWith('.js')) {
        let content = fs.readFileSync(f, 'utf8');
        let edited = false;
        
        if (content.includes('purple')) {
            content = content.replace(/purple/g, 'indigo');
            edited = true;
        }
        
        if (content.includes('Adela Mining')) {
            content = content.replace(/Adela Mining/g, 'Nova Platform');
            edited = true;
        }

        if (content.includes('https://i.imgur.com/bjYgoI6.png')) {
            // Replace with a clean generic logo
            content = content.replace(/https:\/\/i\.imgur\.com\/bjYgoI6\.png/g, 'https://images.unsplash.com/photo-1614680376573-3e4e1ef4142a?w=128&h=128&fit=crop&q=80');
            edited = true;
        }

        // Make other textual replacements for "employee ready" meaning (professional)
        if (content.includes('𝑨𝒄𝒉𝒆𝒕𝒆𝒛 𝒖𝒏𝒆 𝒎𝒊𝒏𝒆 𝒅’𝒐𝒓')) {
            content = content.replace(/𝑨𝒄𝒉𝒆𝒕𝒆𝒛 𝒖𝒏𝒆 𝒎𝒊𝒏𝒆 𝒅’𝒐𝒓 𝒐𝒖 𝒅𝒆 𝒅𝒊𝒂𝒎𝒂𝒏𝒕 𝒆𝒕 𝒇𝒂𝒊𝒕𝒆𝒔 𝒇𝒓𝒖𝒄𝒕𝒊𝒇𝒊𝒆𝒓 𝒗𝒐𝒕𝒓𝒆 𝒄𝒂𝒑𝒊𝒕𝒂𝒍\./g, 'Découvrez nos solutions de rentabilité et faites fructifier votre capital.');
            edited = true;
        }

        if (edited) {
            fs.writeFileSync(f, content);
            console.log('Updated ' + f);
        }
    }
});
